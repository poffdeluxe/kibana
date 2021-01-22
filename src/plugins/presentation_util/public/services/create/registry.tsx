/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
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
