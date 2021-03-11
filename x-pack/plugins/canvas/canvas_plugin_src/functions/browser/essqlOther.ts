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
  query: string;
  count: number;
  timezone: string;
}

export function essqlOther(): ExpressionFunctionDefinition<
  'essqlOther',
  ExpressionValueFilter,
  Arguments,
  any
> {
  const { help, args: argHelp } = getFunctionHelp().essql;

  return {
    name: 'essqlOther',
    type: 'number',
    context: {
      types: ['filter'],
    },
    help,
    args: {
      query: {
        aliases: ['_', 'q'],
        types: ['string'],
        help: argHelp.query,
      },
      count: {
        types: ['number'],
        help: argHelp.count,
        default: 1000,
      },
      timezone: {
        aliases: ['tz'],
        types: ['string'],
        default: 'UTC',
        help: argHelp.timezone,
      },
    },
    fn: (input, args, handlers) => {
      const search = searchService.getService().search;
      const req = {
        ...args,
        filter: input.and,
      };

      return search
        .search<any, any>(req, { strategy: 'essql' })
        .toPromise()
        .then((resp: any) => {
          return {
            type: 'datatable',
            meta: {
              type: 'essql',
            },
            ...resp,
          };
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
