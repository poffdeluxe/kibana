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

import {
  OnSaveProps,
  SaveModalState,
  SavedObjectSaveModal,
} from '../../../../plugins/saved_objects/public';

import './saved_object_save_modal_dashboard.scss';
import { SaveModalDashboardSelector } from './saved_object_save_modal_dashboard_selector';

interface SaveModalDocumentInfo {
  id?: string;
  title: string;
  description?: string;
}

export interface SaveModalDashboardProps {
  documentInfo: SaveModalDocumentInfo;
  objectType: string;
  onClose: () => void;
  onSave: (props: OnSaveProps & { dashboardId: string | null }) => void;
  tagOptions?: React.ReactNode | ((state: SaveModalState) => React.ReactNode);
}

export function SavedObjectSaveModalDashboard(props: SaveModalDashboardProps) {
  const { documentInfo, tagOptions, objectType, onClose } = props;
  const { id: documentId } = documentInfo;
  const initialCopyOnSave = !Boolean(documentId);

  const [dashboardOption, setDashboardOption] = useState<'new' | 'existing' | null>(
    documentId ? null : 'existing'
  );
  const [selectedDashboard, setSelectedDashboard] = useState<{ id: string; name: string } | null>(
    null
  );
  const [copyOnSave, setCopyOnSave] = useState<boolean>(initialCopyOnSave);

  const rightOptions = () => (
    <SaveModalDashboardSelector
      onSelect={(dash) => {
        setSelectedDashboard(dash);
      }}
      {...{ copyOnSave, documentId }}
    />
  );

  const onCopyOnSaveChange = (newCopyOnSave: boolean) => {
    setDashboardOption(null);
    setCopyOnSave(newCopyOnSave);
  };

  const onModalSave = (onSaveProps: OnSaveProps) => {
    let dashboardId = null;

    // Don't save with a dashboard ID if we're
    // just updating an existing visualization
    if (!(!onSaveProps.newCopyOnSave && documentId)) {
      if (dashboardOption === 'existing') {
        dashboardId = selectedDashboard?.id || null;
      } else {
        dashboardId = dashboardOption;
      }
    }

    props.onSave({ ...onSaveProps, dashboardId });
  };

  const saveLibraryLabel =
    !copyOnSave && documentId
      ? i18n.translate('presentationUtil.saveModalDashboard.saveLabel', {
          defaultMessage: 'Save',
        })
      : i18n.translate('presentationUtil.saveModalDashboard.saveToLibraryLabel', {
          defaultMessage: 'Save and add to library',
        });

  const saveDashboardLabel = i18n.translate(
    'presentationUtil.saveModalDashboard.saveAndGoToDashboardLabel',
    {
      defaultMessage: 'Save and go to Dashboard',
    }
  );

  const confirmButtonLabel = dashboardOption === null ? saveLibraryLabel : saveDashboardLabel;

  const isValid = !(dashboardOption === 'existing' && selectedDashboard === null);

  return (
    <SavedObjectSaveModal
      onSave={onModalSave}
      title={documentInfo.title}
      showCopyOnSave={documentId ? true : false}
      options={dashboardOption === null ? tagOptions : undefined} // Show tags when not adding to dashboard
      description={documentInfo.description}
      showDescription={true}
      {...{
        confirmButtonLabel,
        initialCopyOnSave,
        isValid,
        objectType,
        onClose,
        onCopyOnSaveChange,
        rightOptions,
      }}
    />
  );
}
