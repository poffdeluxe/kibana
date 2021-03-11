/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { from } from 'rxjs';
import { map, zipObject } from 'lodash';

import { IKibanaSearchRequest } from 'src/plugins/data/common';
import { ISearchStrategy, PluginStart } from 'src/plugins/data/server';

import { buildBoolArray } from './build_bool_array';
import { sanitizeName } from './sanitize_name';
import { normalizeType } from './normalize_type';

// import { IMyStrategyResponse, IMyStrategyRequest } from '../common';

import { ExpressionValueFilter } from '../../types';

interface Args extends IKibanaSearchRequest {
  count: number;
  query: string;
  timezone?: string;
  filter: ExpressionValueFilter[];
}

interface CursorResponse {
  cursor?: string;
  rows: string[][];
}

type QueryResponse = CursorResponse & {
  columns: Array<{
    name: string;
    type: string;
  }>;
  cursor?: string;
  rows: string[][];
};

interface Response {
  columns: Array<{
    id: string;
    name: string;
    meta: {
      type: string;
    };
  }>;
  rows: any;

  rawResponse: any;
}

export const ESSqlSearchStrategyProvider = (data: PluginStart): ISearchStrategy<Args, Response> => {
  return {
    search: (request, options, { esClient }) => {
      const { count, query, filter, timezone } = request;

      const searchUntilEnd = async () => {
        let response = (
          await esClient.asCurrentUser.transport.request({
            path: '/_sql?format=json',
            method: 'POST',
            body: {
              query,
              time_zone: timezone,
              fetch_size: count,
              client_id: 'canvas',
              filter: {
                bool: {
                  must: [{ match_all: {} }, ...buildBoolArray(filter)],
                },
              },
            },
          })
        ).body as QueryResponse;

        const columns = response.columns.map(({ name, type }) => {
          return {
            id: sanitizeName(name),
            name: sanitizeName(name),
            meta: { type: normalizeType(type) },
          };
        });
        const columnNames = map(columns, 'name');
        let rows = response.rows.map((row) => zipObject(columnNames, row));

        while (rows.length < count && response.cursor !== undefined) {
          response = (
            await esClient.asCurrentUser.transport.request({
              path: '/_sql?format=json',
              method: 'POST',
              body: {
                cursor: response.cursor,
              },
            })
          ).body as QueryResponse;

          rows = [...rows, ...response.rows.map((row) => zipObject(columnNames, row))];
        }

        if (response.cursor !== undefined) {
          await esClient.asCurrentUser.transport.request({
            path: '/_sql/close',
            method: 'POST',
            body: {
              cursor: response.cursor,
            },
          });
        }

        return {
          // type: 'datatable',
          // meta: {
          //   type: 'essql',
          // },
          columns,
          rows,
          rawResponse: response,
        };
      };

      return from(searchUntilEnd());
    },

    cancel: async (id, options, deps) => {
      // if (es.cancel) {
      //   await es.cancel(id, options, deps);
      // }
    },
  };
};
