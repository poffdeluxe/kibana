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

import { DashboardPicker, DashboardPickerProps } from './dashboard_picker';

import './saved_object_save_modal_dashboard.scss';

export interface SaveModalDashboardSelectorProps {
  canCreateNewDashboards: boolean;
  canEditDashboards: boolean;

  copyOnSave: boolean;
  documentId?: string;
  onSelect: DashboardPickerProps['onChange'];
}

export function SaveModalDashboardSelector(props: SaveModalDashboardSelectorProps) {
  const { canCreateNewDashboards, canEditDashboards, documentId, onSelect, copyOnSave } = props;

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
        <EuiPanel color="subdued" hasShadow={false}>
          <div>
            {canEditDashboards && (
              <>
                {' '}
                <EuiRadio
                  checked={dashboardOption === 'existing'}
                  id="existing"
                  name="dashboard-option"
                  label={i18n.translate(
                    'presentationUtil.saveModalDashboard.existingDashboardOptionLabel',
                    {
                      defaultMessage: 'Existing',
                    }
                  )}
                  onChange={() => setDashboardOption('existing')}
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
            {canCreateNewDashboards && (
              <>
                {' '}
                <EuiRadio
                  checked={dashboardOption === 'new'}
                  id="new"
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
              id="library"
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
