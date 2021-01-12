/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { CoreSetup, CoreStart, Plugin } from '../../../core/public';
import { pluginServices, kibanaServiceRegistry } from './services';
import {
  PresentationUtilPluginSetup,
  PresentationUtilPluginStart,
  PresentationUtilPluginSetupDeps,
  PresentationUtilPluginStartDeps,
} from './types';

export class PresentationUtilPlugin
  implements
    Plugin<
      PresentationUtilPluginSetup,
      PresentationUtilPluginStart,
      PresentationUtilPluginSetupDeps,
      PresentationUtilPluginStartDeps
    > {
  public setup(
    coreSetup: CoreSetup<PresentationUtilPluginStart>,
    setupPlugins: PresentationUtilPluginSetup
  ): PresentationUtilPluginSetup {
    const getServices = async () => {
      if (!pluginServices.isStarted()) {
        const [coreStart, startPlugins] = await coreSetup.getStartServices();
        kibanaServiceRegistry.start({ coreStart, coreSetup, startPlugins, setupPlugins });
        pluginServices.setRegistry(kibanaServiceRegistry);
      }

      return pluginServices.getServices();
    };
    return { getServices };
  }

  public async start(
    _startCore: CoreStart,
    _startPlugins: PresentationUtilPluginStartDeps
  ): Promise<PresentationUtilPluginStart> {
    return {};
  }

  public stop() {}
}
