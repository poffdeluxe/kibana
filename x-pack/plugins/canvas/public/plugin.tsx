/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { BehaviorSubject } from 'rxjs';
import {
  CoreSetup,
  CoreStart,
  Plugin,
  AppMountParameters,
  DEFAULT_APP_CATEGORIES,
  AppUpdater,
} from '../../../../src/core/public';
import { HomePublicPluginSetup } from '../../../../src/plugins/home/public';
import { initLoadingIndicator } from './lib/loading_indicator';
// @ts-ignore untyped local
import { historyProvider } from './lib/history_provider';
import { featureCatalogueEntry } from './feature_catalogue_entry';
import { ExpressionsSetup, ExpressionsStart } from '../../../../src/plugins/expressions/public';
import { DataPublicPluginSetup } from '../../../../src/plugins/data/public';
import { UiActionsStart } from '../../../../src/plugins/ui_actions/public';
import { EmbeddableStart } from '../../../../src/plugins/embeddable/public';
import { UsageCollectionSetup } from '../../../../src/plugins/usage_collection/public';
import { Start as InspectorStart } from '../../../../src/plugins/inspector/public';
import { createKbnUrlTracker } from '../../../../src/plugins/kibana_utils/public';
// @ts-ignore untyped local
import { argTypeSpecs } from './expression_types/arg_types';
import { transitions } from './transitions';
import { getPluginApi, CanvasApi } from './plugin_api';
import { initFunctions } from './functions';
import { CanvasSrcPlugin } from '../canvas_plugin_src/plugin';
export { CoreStart, CoreSetup };

/**
 * These are the private interfaces for the services your plugin depends on.
 * @internal
 */
// This interface will be built out as we require other plugins for setup
export interface CanvasSetupDeps {
  data: DataPublicPluginSetup;
  expressions: ExpressionsSetup;
  home: HomePublicPluginSetup;
  usageCollection?: UsageCollectionSetup;
}

export interface CanvasStartDeps {
  embeddable: EmbeddableStart;
  expressions: ExpressionsStart;
  inspector: InspectorStart;
  uiActions: UiActionsStart;
}

/**
 * These are the interfaces with your public contracts. You should export these
 * for other plugins to use in _their_ `SetupDeps`/`StartDeps` interfaces.
 * @public
 */
// These interfaces are empty for now but will be populate as we need to export
// things for other plugins to use at startup or runtime
export type CanvasSetup = CanvasApi;
export type CanvasStart = void;

/** @internal */
export class CanvasPlugin
  implements Plugin<CanvasSetup, CanvasStart, CanvasSetupDeps, CanvasStartDeps> {
  private appUpdater = new BehaviorSubject<AppUpdater>(() => ({}));
  // TODO: Do we want to completely move canvas_plugin_src into it's own plugin?
  private srcPlugin = new CanvasSrcPlugin();

  public setup(core: CoreSetup<CanvasStartDeps>, plugins: CanvasSetupDeps) {
    const { api: canvasApi, registries } = getPluginApi(plugins.expressions);

    this.srcPlugin.setup(core, { canvas: canvasApi });

    const { appMounted, appUnMounted } = createKbnUrlTracker({
      baseUrl: core.http.basePath.prepend('/app/canvas'),
      defaultSubUrl: `#/`,
      storageKey: 'lastUrl:canvas',
      navLinkUpdater$: this.appUpdater,
      toastNotifications: core.notifications.toasts,
      stateParams: [],
      history: historyProvider().historyInstance,
      shouldTrackUrlUpdate: () => true,
    });

    core.application.register({
      category: DEFAULT_APP_CATEGORIES.kibana,
      defaultPath: '#',
      id: 'canvas',
      title: 'Canvas',
      euiIconType: 'canvasApp',
      order: 0, // need to figure out if this is the proper order for us
      updater$: this.appUpdater,
      mount: async (params: AppMountParameters) => {
        // Load application bundle
        const { renderApp, initializeCanvas, teardownCanvas } = await import('./application');

        // Get start services
        const [coreStart, depsStart] = await core.getStartServices();

        // Tell URL tracker we've mounted the app
        appMounted();

        const canvasStore = await initializeCanvas(core, coreStart, plugins, depsStart, registries);

        const unmount = renderApp(coreStart, depsStart, params, canvasStore);

        return () => {
          unmount();

          // Tell URL tracker we're unmounting the app
          appUnMounted();

          teardownCanvas(coreStart, depsStart);
        };
      },
    });

    plugins.home.featureCatalogue.register(featureCatalogueEntry);

    // Register core canvas stuff
    canvasApi.addFunctions(
      initFunctions({
        timefilter: plugins.data.query.timefilter.timefilter,
        prependBasePath: core.http.basePath.prepend,
        typesRegistry: plugins.expressions.__LEGACY.types,
      })
    );
    canvasApi.addArgumentUIs(argTypeSpecs);
    canvasApi.addTransitions(transitions);

    return {
      ...canvasApi,
    };
  }

  public start(core: CoreStart, plugins: CanvasStartDeps) {
    this.srcPlugin.start(core, plugins);
    initLoadingIndicator(core.http.addLoadingCountSource);
  }
}
