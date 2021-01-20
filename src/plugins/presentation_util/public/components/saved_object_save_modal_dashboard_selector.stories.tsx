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
import { action } from '@storybook/addon-actions';

import { SaveModalDashboardSelector } from './saved_object_save_modal_dashboard_selector';

export default {
  component: SaveModalDashboardSelector,
  title: 'Save Modal Dashboard Selector',
  description: 'A selector for determining where an object will be saved after it is created.',
  argTypes: {
    hasDocumentId: {
      control: 'boolean',
    },
    copyOnSave: {
      control: 'boolean',
    },
    canCreateNewDashboards: {
      control: 'boolean',
      defaultValue: true,
    },
    canEditDashboards: {
      control: 'boolean',
      defaultValue: true,
    },
  },
};

export function Example({
  canCreateNewDashboards,
  canEditDashboards,
  copyOnSave,
  hasDocumentId,
}: {
  canCreateNewDashboards: boolean;
  canEditDashboards: boolean;
  copyOnSave: boolean;
  hasDocumentId: boolean;
}) {
  return (
    <SaveModalDashboardSelector
      canCreateNewDashboards={canCreateNewDashboards}
      canEditDashboards={canEditDashboards}
      onSelect={action('onSelect')}
      copyOnSave={copyOnSave}
      documentId={hasDocumentId ? 'abc' : undefined}
    />
  );
}
