/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { map } from 'rxjs/operators';
import { ISearchStrategy, PluginStart } from 'src/plugins/data/server';
// import { IMyStrategyResponse, IMyStrategyRequest } from '../common';

import { ExpressionValueFilter } from '../../types';

interface Args {
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
  type: 'datatable';
  meta: {
    type: 'essql';
  };
  columns: Array<{
    name: string;
    type: string;
  }>;
  rows: string[][];
}

export const ESSqlSearchStrategyProvider = (data: PluginStart): ISearchStrategy<Args, Response> => {
  const es = data.search.getSearchStrategy('ese');
  return {
    search: (request, options, deps) => {
      const { count, query, filter, timezone } = request;
      let response = es.transit.request({
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
      });
      // let response: QueryResponse = await elasticsearchClient<QueryResponse>('transport.request', {
      //   path: '/_sql?format=json',
      //   method: 'POST',
      //   body: {
      //     query,
      //     time_zone: timezone,
      //     fetch_size: count,
      //     client_id: 'canvas',
      //     filter: {
      //       bool: {
      //         must: [{ match_all: {} }, ...buildBoolArray(filter)],
      //       },
      //     },
      //   },
      // });

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
        response = await elasticsearchClient<QueryResponse>('transport.request', {
          path: '/_sql?format=json',
          method: 'POST',
          body: {
            cursor: response.cursor,
          },
        });

        rows = [...rows, ...response.rows.map((row) => zipObject(columnNames, row))];
      }

      if (response.cursor !== undefined) {
        elasticsearchClient('transport.request', {
          path: '/_sql/close',
          method: 'POST',
          body: {
            cursor: response.cursor,
          },
        });
      }

      return {
        type: 'datatable',
        meta: {
          type: 'essql',
        },
        columns,
        rows,
      };
    },
    // es.search(request, options, deps).pipe(
    //   map((esSearchRes) => ({
    //     ...esSearchRes,
    //     cool: request.get_cool ? 'YES' : 'NOPE',
    //   }))
    // ),
    cancel: async (id, options, deps) => {
      if (es.cancel) {
        await es.cancel(id, options, deps);
      }
    },
  };
};
