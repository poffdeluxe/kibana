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
import { mapValues, values } from 'lodash';
import { PluginServiceProviders, PluginServiceProvider } from './provider';

type Provider<Services, StartParameters> = PluginServiceProvider<
  Services[keyof Services],
  StartParameters
>;

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
  private services: Services | null = null;

  constructor(providers: PluginServiceProviders<Services, StartParameters>) {
    this.providers = providers;
  }

  isStarted() {
    return !!this.services;
  }

  start(params: StartParameters) {
    values<Provider<Services, StartParameters>>(this.providers).map((provider) =>
      provider.start(params)
    );
    this.services = mapValues(this.providers, (provider) => provider.getService()) as Services;
  }

  stop() {
    values<Provider<Services, StartParameters>>(this.providers).map((provider) => provider.stop());
    this.services = null;
  }

  public getServices(): Services {
    if (this.services === null) {
      throw new Error('Registry not started');
    }

    return this.services;
  }

  public getService(name: keyof Services): Services[keyof Services] {
    if (this.services === null) {
      throw new Error('Registry not started');
    }

    return this.services[name];
  }
}
