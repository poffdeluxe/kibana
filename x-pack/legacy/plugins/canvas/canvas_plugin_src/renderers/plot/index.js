/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// This bit of hackiness is required because this isn't part of the main kibana bundle
import React from 'react';
import ReactDOM from 'react-dom';

import { Chart, Settings, Axis, BarSeries, LineSeries, timeFormatter } from '@elastic/charts';

import 'jquery';
import '../../lib/flot-charts';

import { debounce, includes } from 'lodash';
import { RendererStrings } from '../../../i18n';
import { size } from './plugins/size';
import { text } from './plugins/text';

const { plot: strings } = RendererStrings;

const dateFormatter = timeFormatter('HH:mm');

const renderChart = (series, index, xAxis, yAxis) => {
  const charts = [];

  if (series.barSeriesStyle) {
    charts.push(
      <BarSeries
        key={`bar-${index}`}
        id={`bar-${index}`}
        xScaleType={xAxis.scaleType}
        yScaleType={yAxis.scaleType}
        xAccessor={0}
        yAccessors={[1]}
        timeZone={'utc'}
        data={series.data}
        barSeriesStyle={series.barSeriesStyle}
      />
    );
  }

  if (series.lineSeriesStyle) {
    charts.push(
      <LineSeries
        key={`line-${index}`}
        id={`line-${index}`}
        xScaleType={xAxis.scaleType}
        yScaleType={yAxis.scaleType}
        xAccessor={0}
        yAccessors={[1]}
        timeZone={'utc'}
        data={series.data}
        lineSeriesStyle={series.lineSeriesStyle}
      />
    );
  }

  return <React.Fragment key={index}>{charts}</React.Fragment>;
};

function renderWithESC(domNode, config, handlers) {
  const xAxis = {
    show: config.options.xaxis.show,
    scaleType: config.options.xaxis.mode === 'time' ? 'time' : 'linear',
    tickFormat: config.options.xaxis.mode === 'time' ? dateFormatter : undefined,
  };

  const yAxis = {
    show: config.options.yaxis.show,
    scaleType: config.options.yaxis.mode === 'time' ? 'time' : 'linear',
    tickFormat: config.options.yaxis.mode === 'time' ? dateFormatter : undefined,
  };

  const theme = {
    ...config.options.series,
    colors: {
      vizColors: config.options.colors,
    },
    scales: {
      barsPadding: 0,
    },
  };

  const sample = (
    <Chart>
      <Settings rotation={0} animateData={false} tooltip="none" theme={theme} />
      {xAxis.show && <Axis id="bottom" position="bottom" tickFormat={xAxis.tickFormat} />}
      {yAxis.show && <Axis id="left2" position="left" tickFormat={yAxis.tickFormat} />}
      {config.data.map((series, i) => renderChart(series, i, xAxis, yAxis))}
    </Chart>
  );

  ReactDOM.render(sample, domNode, () => handlers.done());

  handlers.onDestroy(() => ReactDOM.unmountComponentAtNode(domNode));
}

const render = (domNode, config, handlers) => {
  console.log(config);
  console.log(config.data);

  if (!config.options.useFlot) {
    return renderWithESC(domNode, config, handlers);
  }

  // TODO: OH NOES
  if (!includes($.plot.plugins, size)) {
    $.plot.plugins.push(size);
  }
  if (!includes($.plot.plugins, text)) {
    $.plot.plugins.push(text);
  }

  let plot;
  function draw() {
    if (domNode.clientHeight < 1 || domNode.clientWidth < 1) {
      return;
    }

    if (config.font) {
      const legendFormatter = label => {
        const labelSpan = document.createElement('span');
        Object.assign(labelSpan.style, config.font.spec);
        labelSpan.textContent = label;
        return labelSpan.outerHTML;
      };
      config.options.legend.labelFormatter = legendFormatter;
    }

    try {
      if (!plot) {
        plot = $.plot($(domNode), config.data, config.options);
      } else {
        plot.resize();
        plot.setupGrid();
        plot.draw();
      }
    } catch (e) {
      // Nope
    }
  }

  function destroy() {
    if (plot) {
      plot.shutdown();
    }
  }

  handlers.onDestroy(destroy);
  handlers.onResize(debounce(draw, 40, { maxWait: 40 })); // 1000 / 40 = 25fps

  draw();

  return handlers.done();
};

export const plot = () => ({
  name: 'plot',
  displayName: strings.getDisplayName(),
  help: strings.getHelpDescription(),
  reuseDomNode: true,
  render,
});
