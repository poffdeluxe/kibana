/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
 */

import React, { useState } from 'react';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiRadio,
  EuiIconTip,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';

import { pluginServices } from '../services';
import { DashboardPicker, DashboardPickerProps } from './dashboard_picker';

import './saved_object_save_modal_dashboard.scss';

export interface SaveModalDashboardSelectorProps {
  copyOnSave: boolean;
  documentId?: string;
  onSelect: DashboardPickerProps['onChange'];
}

export function SaveModalDashboardSelector(props: SaveModalDashboardSelectorProps) {
  const { documentId, onSelect, copyOnSave } = props;

  const { capabilities } = pluginServices.getContextHooks();
  const { canCreateNewDashboards, canEditDashboards } = capabilities.useContext();

  const [dashboardOption, setDashboardOption] = useState<'new' | 'existing' | null>(
    documentId ? null : 'existing'
  );

  const isDisabled = !copyOnSave && !!documentId;

  return (
    <>
      <EuiFormRow
        label={
          <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
            <EuiFlexItem grow={false}>
              <FormattedMessage
                id="presentationUtil.saveModalDashboard.addToDashboardLabel"
                defaultMessage="Add to dashboard"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiIconTip
                type="iInCircle"
                content={
                  <FormattedMessage
                    id="presentationUtil.saveModalDashboard.dashboardInfoTooltip"
                    defaultMessage="Items added to a dashboard will not appear in the library and must be edited from the dashboard."
                  />
                }
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        hasChildLabel={false}
      >
        <EuiPanel color="subdued" hasShadow={false} data-test-subj="add-to-dashboard-options">
          <div>
            {canEditDashboards() && (
              <>
                {' '}
                <EuiRadio
                  checked={dashboardOption === 'existing'}
                  id="existing-dashboard-option"
                  name="dashboard-option"
                  label={i18n.translate(
                    'presentationUtil.saveModalDashboard.existingDashboardOptionLabel',
                    {
                      defaultMessage: 'Existing',
                    }
                  )}
                  onChange={() => setDashboardOption('existing')}
                  disabled={isDisabled}
                />
                <div className="savAddDashboard__searchDashboards">
                  <DashboardPicker
                    isDisabled={dashboardOption !== 'existing'}
                    onChange={onSelect}
                  />
                </div>
                <EuiSpacer size="s" />
              </>
            )}
            {canCreateNewDashboards() && (
              <>
                {' '}
                <EuiRadio
                  checked={dashboardOption === 'new'}
                  id="new-dashboard-option"
                  name="dashboard-option"
                  label={i18n.translate(
                    'presentationUtil.saveModalDashboard.newDashboardOptionLabel',
                    {
                      defaultMessage: 'New',
                    }
                  )}
                  onChange={() => setDashboardOption('new')}
                  disabled={isDisabled}
                />
                <EuiSpacer size="s" />
              </>
            )}
            <EuiRadio
              checked={dashboardOption === null}
              id="add-to-library-option"
              name="dashboard-option"
              label={i18n.translate('presentationUtil.saveModalDashboard.libraryOptionLabel', {
                defaultMessage: 'No dashboard, but add to library',
              })}
              onChange={() => setDashboardOption(null)}
              disabled={isDisabled}
            />
          </div>
        </EuiPanel>
      </EuiFormRow>
    </>
  );
}
