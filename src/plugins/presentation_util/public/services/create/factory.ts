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

import { BehaviorSubject } from 'rxjs';
import { CoreStart, AppUpdater } from 'src/core/public';

/**
 * A factory function for creating a service.
 *
 * The `Service` generic determines the shape of the API being produced.
 * The `StartParameters` generic determines what parameters are expected to
 * create the service.
 */
export type PluginServiceFactory<Service, Parameters = {}> = (params: Parameters) => Service;

/**
 * Parameters necessary to create a Kibana-based service, (e.g. during Plugin
 * startup or setup).
 *
 * The `Start` generic refers to the specific Plugin `TPluginsStart`.
 */
export interface KibanaPluginServiceParams<Start extends {}> {
  coreStart: CoreStart;
  startPlugins: Start;
  appUpdater?: BehaviorSubject<AppUpdater>;
}

/**
 * A factory function for creating a Kibana-based service.
 *
 * The `Service` generic determines the shape of the API being produced.
 * The `Setup` generic refers to the specific Plugin `TPluginsSetup`.
 * The `Start` generic refers to the specific Plugin `TPluginsStart`.
 */
export type KibanaPluginServiceFactory<Service, Start extends {}> = (
  params: KibanaPluginServiceParams<Start>
) => Service;
