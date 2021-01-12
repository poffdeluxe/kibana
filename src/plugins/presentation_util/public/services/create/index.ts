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

  setRegistry(registry: PluginServiceRegistry<Services, any>) {
    this.registry = registry;
  }

  getServices(): Services {
    if (!this.registry) {
      throw new Error('Registry not provided.');
    }

    if (!this.isStarted()) {
      throw new Error('Registry not started.');
    }

    return this.registry.getServices();
  }

  hasRegistry() {
    return !!this.registry;
  }

  isStarted() {
    if (!this.registry) {
      return false;
    }

    return this.registry.isStarted();
  }
}
