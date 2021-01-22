/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
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
  },
};

export function Example({
  copyOnSave,
  hasDocumentId,
}: {
  copyOnSave: boolean;
  hasDocumentId: boolean;
}) {
  return (
    <SaveModalDashboardSelector
      onSelect={action('onSelect')}
      copyOnSave={copyOnSave}
      documentId={hasDocumentId ? 'abc' : undefined}
    />
  );
}
