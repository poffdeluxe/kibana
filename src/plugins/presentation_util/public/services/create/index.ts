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

import { mapValues } from 'lodash';

import { PluginServiceRegistry } from './registry';

export { PluginServiceRegistry } from './registry';
export { PluginServiceProvider, PluginServiceProviders } from './provider';
export {
  PluginServiceFactory,
  KibanaPluginServiceFactory,
  KibanaPluginServiceParams,
} from './factory';

/**
 * `PluginServices` is a top-level class for specifying and accessing services within a plugin.
 *
 * A `PluginServices` object can be provided with a `PluginServiceRegistry` at any time, which will
 * then be used to provide services to any component that accesses it.
 *
 * The `Services` generic determines the shape of all service APIs being produced.
 */
export class PluginServices<Services> {
  private registry: PluginServiceRegistry<Services, any> | null = null;

  setRegistry(registry: PluginServiceRegistry<Services, any> | null) {
    if (registry && !registry.isStarted()) {
      throw new Error('Registry has not been started.');
    }

    this.registry = registry;
  }

  hasRegistry() {
    return !!this.registry;
  }

  private getRegistry() {
    if (!this.registry) {
      throw new Error('No registry has been provided.');
    }

    return this.registry;
  }

  getContextProvider() {
    return this.getRegistry().getContextProvider();
  }

  getContextHooks(): { [K in keyof Services]: { useContext: () => Services[K] } } {
    const registry = this.getRegistry();
    const providers = registry.getServiceProviders();

    // @ts-expect-error Need to fix this; the type isn't fully understood inferred.
    return mapValues(providers, (provider) => ({
      useContext: provider.useContext(),
    }));
  }
}
