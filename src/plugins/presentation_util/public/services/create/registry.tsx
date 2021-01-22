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

import React from 'react';
import { values } from 'lodash';
import { PluginServiceProvider, PluginServiceProviders } from './provider';

/**
 * A `PluginServiceRegistry` maintains a set of service providers which can be collectively
 * started, stopped or retreived.
 *
 * The `Services` generic determines the shape of all service APIs being produced.
 * The `StartParameters` generic determines what parameters are expected to
 * start the service.
 */
export class PluginServiceRegistry<Services, StartParameters = {}> {
  private providers: PluginServiceProviders<Services, StartParameters>;
  private _isStarted = false;

  constructor(providers: PluginServiceProviders<Services, StartParameters>) {
    this.providers = providers;
  }

  isStarted() {
    return this._isStarted;
  }

  getServiceProviders() {
    if (!this._isStarted) {
      throw new Error('Registry not started');
    }
    return this.providers;
  }

  getContextProvider() {
    const provider: React.FC = ({ children }) => (
      <>
        {values<PluginServiceProvider<any, any>>(this.getServiceProviders()).reduceRight(
          (acc, serviceProvider) => {
            return <serviceProvider.Provider>{acc}</serviceProvider.Provider>;
          },
          children
        )}
      </>
    );

    return provider;
  }

  start(params: StartParameters) {
    values<PluginServiceProvider<any, any>>(this.providers).map((serviceProvider) =>
      serviceProvider.start(params)
    );
    this._isStarted = true;
    return this;
  }

  stop() {
    values<PluginServiceProvider<any, any>>(this.providers).map((serviceProvider) =>
      serviceProvider.stop()
    );
    this._isStarted = false;
    return this;
  }
}
