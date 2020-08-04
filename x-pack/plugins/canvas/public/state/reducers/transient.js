/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { handleActions } from 'redux-actions';
import immutable from 'object-path-immutable';
import { restoreHistory } from '../actions/history';
import * as pageActions from '../actions/pages';
import * as transientActions from '../actions/transient';
import { removeElements } from '../actions/elements';
import { SET_REFRESH_INTERVAL, ENABLE_AUTOPLAY, SET_AUTOPLAY_INTERVAL } from '../actions/workpad';

const { set, del } = immutable;

export const transientReducer = handleActions(
  {
    // clear all the resolved args when restoring the history
    // TODO: we shouldn't need to reset the resolved args for history
    [restoreHistory]: (transientState) => set(transientState, 'resolvedArgs', {}),

    [removeElements]: (transientState, { payload: { elementIds } }) => {
      const { selectedToplevelNodes } = transientState;
      return del(
        {
          ...transientState,
          selectedToplevelNodes: selectedToplevelNodes.filter((n) => elementIds.indexOf(n) < 0),
        },
        ['resolvedArgs', elementIds]
      );
    },

    [transientActions.setFirstLoad]: (transientState, { payload }) => {
      return set(transientState, 'isFirstLoad', Boolean(payload));
    },

    [transientActions.setFullscreen]: (transientState, { payload }) => {
      return set(transientState, 'fullscreen', Boolean(payload));
    },

    [transientActions.setElementStats]: (transientState, { payload }) => {
      return set(transientState, 'elementStats', payload);
    },

    [transientActions.selectToplevelNodes]: (transientState, { payload }) => {
      return {
        ...transientState,
        selectedToplevelNodes: payload,
      };
    },

    [transientActions.setZoomScale]: (transientState, { payload }) => {
      return {
        ...transientState,
        zoomScale: payload || 1,
      };
    },

    [pageActions.setPage]: (transientState) => {
      return { ...transientState, selectedToplevelNodes: [] };
    },

    [pageActions.addPage]: (transientState) => {
      return { ...transientState, selectedToplevelNodes: [] };
    },

    [pageActions.duplicatePage]: (transientState) => {
      return { ...transientState, selectedToplevelNodes: [] };
    },

    [SET_REFRESH_INTERVAL]: (transientState, { payload }) => {
      return { ...transientState, refresh: { interval: Number(payload) || 0 } };
    },

    [ENABLE_AUTOPLAY]: (transientState, { payload }) => {
      return set(transientState, 'autoplay.enabled', Boolean(payload) || false);
    },

    [SET_AUTOPLAY_INTERVAL]: (transientState, { payload }) => {
      return set(transientState, 'autoplay.interval', Number(payload) || 0);
    },
  },
  {}
);
