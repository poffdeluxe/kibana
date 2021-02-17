/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  ExpressionFunctionDefinition,
  ExpressionValueFilter,
} from 'src/plugins/expressions/common';
/* eslint-disable */
// @ts-expect-error untyped local
import { buildESRequest } from '../../../server/lib/build_es_request';

import { searchService } from '../../../public/services';
/* eslint-enable */
import { getFunctionHelp } from '../../../i18n';

interface Arguments {
  index: string | null;
  query: string;
}

export function escountOther(): ExpressionFunctionDefinition<
  'escountOther',
  ExpressionValueFilter,
  Arguments,
  any
> {
  const { help, args: argHelp } = getFunctionHelp().escount;

  return {
    name: 'escountOther',
    type: 'number',
    context: {
      types: ['filter'],
    },
    help,
    args: {
      query: {
        types: ['string'],
        aliases: ['_', 'q'],
        help: argHelp.query,
        default: '"-_index:.kibana"',
      },
      index: {
        types: ['string'],
        default: '_all',
        help: argHelp.index,
      },
    },
    fn: (input, args, handlers) => {
      input.and = input.and.concat([
        {
          type: 'filter',
          filterType: 'luceneQueryString',
          query: args.query,
          and: [],
        },
      ]);

      const esRequest = buildESRequest(
        {
          index: args.index,
          body: {
            track_total_hits: true,
            size: 0,
            query: {
              bool: {
                must: [{ match_all: {} }],
              },
            },
          },
        },
        input
      );

      const search = searchService.getService().search;
      const req = {
        params: {
          ...esRequest,
        },
      };

      return search
        .search(req)
        .toPromise()
        .then((resp: any) => {
          return resp.rawResponse.hits.total;
        });

      // const searchSubscription$ = search.search(req).subscribe({
      //   next: (res) => {
      //     // if (isCompleteResponse(res)) {
      //     //   setResponse(res.rawResponse);
      //     //   setTimeTook(res.rawResponse.took);
      //     //   const avgResult: number | undefined = res.rawResponse.aggregations
      //     //     ? res.rawResponse.aggregations[1].value
      //     //     : undefined;
      //     //   const message = (
      //     //     <EuiText>
      //     //       Searched {res.rawResponse.hits.total} documents. <br />
      //     //       The average of {selectedNumericField!.name} is{' '}
      //     //       {avgResult ? Math.floor(avgResult) : 0}.
      //     //       <br />
      //     //       Is it Cool? {String((res as IMyStrategyResponse).cool)}
      //     //     </EuiText>
      //     //   );
      //     //   notifications.toasts.addSuccess({
      //     //     title: 'Query result',
      //     //     text: mountReactNode(message),
      //     //   });
      //     searchSubscription$.unsubscribe();
      //   },
      // });
      // return (input, args, (handlers as any) as { search: any }) => {
      //   // .elasticsearchClient('count', esRequest)
      //   // .then((resp: { count: number }) => resp.count);
      //   return "hlelo";
      // };
    },
  };
}
