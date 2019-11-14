/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { get } from 'lodash';
import { SeriesStyle } from '../../../../types';

export const seriesStyleToCharts = (seriesStyle: SeriesStyle) => {
  if (!seriesStyle) {
    return {};
  }

  const lines = get<SeriesStyle['lines']>(seriesStyle, 'lines');
  const bars = get<SeriesStyle['bars']>(seriesStyle, 'bars');
  const fill = get<SeriesStyle['fill']>(seriesStyle, 'fill');
  const color = get<SeriesStyle['color']>(seriesStyle, 'color');
  // const stack = get<SeriesStyle['stack']>(seriesStyle, 'stack');
  // const horizontal = get<SeriesStyle['horizontalBars']>(seriesStyle, 'horizontalBars', false);

  // if (bars <= 0) {
  //   return {};
  // }

  // TODO: fix type
  const retObj: any = {};

  if (bars > 0) {
    retObj.barSeriesStyle = {
      rect: {
        fill: color,
      },
    };
  }

  if (lines > 0) {
    if (fill > 0) {
      retObj.areaSeriesStyle = {
        line: {
          strokeWidth: lines,
          stroke: color,
        },
      };
    } else {
      retObj.lineSeriesStyle = {
        line: {
          strokeWidth: lines,
          stroke: color,
        },
        point: {
          visible: false,
        },
      };
    }
  }

  return retObj;

  // const flotStyle = {
  //   numbers: {
  //     show: true,
  //   },
  //   lines: {
  //     show: lines > 0,
  //     lineWidth: lines,
  //     fillColor: color,
  //     fill: fill / 10,
  //   },
  //   bars: {
  //     show: bars > 0,
  //     barWidth: bars,
  //     fill: 1,
  //     align: 'center',
  //     horizontal,
  //   },
  //   // This is here intentionally even though it is the default.
  //   // We use the `size` plugins for this and if the user says they want points
  //   // we just set the size to be static.
  //   points: { show: false },
  //   bubbles: {
  //     show: true,
  //     fill,
  //   },
  // };

  // if (stack != null) {
  //   (flotStyle as any).stack = stack;
  // }
  // if (color) {
  //   (flotStyle as any).color = color;
  // }

  // return flotStyle;
};
