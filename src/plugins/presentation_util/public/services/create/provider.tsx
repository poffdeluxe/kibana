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

import React, { createContext, useContext } from 'react';
import { PluginServiceFactory } from './factory';

/**
 * A collection of `PluginServiceProvider` objects, keyed by the `Services` API generic.
 *
 * The `Services` generic determines the shape of all service APIs being produced.
 * The `StartParameters` generic determines what parameters are expected to
 * start the service.
 */
export type PluginServiceProviders<Services, StartParameters = {}> = {
  [K in keyof Services]: PluginServiceProvider<Services[K], StartParameters>;
};

/**
 * An object which uses a given factory to start, stop or provide a service.
 *
 * The `Service` generic determines the shape of the API being produced.
 * The `StartParameters` generic determines what parameters are expected to
 * start the service.
 */
export class PluginServiceProvider<Service extends {}, StartParameters = {}> {
  private factory: PluginServiceFactory<Service, StartParameters>;
  private context = createContext<Service | null>(null);
  private pluginService: Service | null = null;
  public readonly Provider: React.FC = ({ children }) => {
    return <this.context.Provider value={this.getService()}>{children}</this.context.Provider>;
  };

  constructor(factory: PluginServiceFactory<Service, StartParameters>) {
    this.factory = factory;
    this.context.displayName = 'PluginServiceContext';
  }

  private getService() {
    if (!this.pluginService) {
      throw new Error('Service not started');
    }
    return this.pluginService;
  }

  start(params: StartParameters) {
    this.pluginService = this.factory(params);
  }

  useContext() {
    return () => {
      const service = useContext(this.context);

      if (!service) {
        throw new Error('Provider is not set up correctly');
      }

      return service;
    };
  }

  stop() {
    this.pluginService = null;
  }
}
