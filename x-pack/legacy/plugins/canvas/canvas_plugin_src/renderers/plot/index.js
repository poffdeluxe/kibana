/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// This bit of hackiness is required because this isn't part of the main kibana bundle
import React from 'react';
import ReactDOM from 'react-dom';

import { Chart, Settings, Axis, BarSeries } from '@elastic/charts';

import 'jquery';
import '../../lib/flot-charts';

import { debounce, includes } from 'lodash';
import { RendererStrings } from '../../../i18n';
import { size } from './plugins/size';
import { text } from './plugins/text';

const { plot: strings } = RendererStrings;

function renderWithESC(domNode, config, handlers) {
  const sample = (
    <Chart className="story-chart">
      <Settings
        rotation={0}
        animateData={false}
        tooltip="none"
        // theme={{
        //   chartPaddings: {
        //     left: 0,
        //     right: 0,
        //     top: 0,
        //     bottom: 0,
        //   },
        //   chartMargins: {
        //     left: 10,
        //     right: 10,
        //     top: 10,
        //     bottom: 10,
        //   },
        // }}
      />
      <Axis id="bottom" position="bottom" title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position="left" />
      <BarSeries
        id="bars"
        name="My test bars"
        xScaleType="linear"
        yScaleType="linear"
        xAccessor={0}
        yAccessors={[1]}
        data={config.data[0].data}
      />
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
