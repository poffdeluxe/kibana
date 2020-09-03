/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ExpressionFunctionDefinition } from 'src/plugins/expressions/common';
import { paulTor14 } from '../../../common/lib/palettes';
import { getFunctionHelp } from '../../../i18n';

interface Arguments {
  color: string[];
  gradient: boolean;
  reverse: boolean;
}

interface Output {
  type: 'palette';
  colors: string[];
  gradient: boolean;
}

export function palette(): ExpressionFunctionDefinition<'palette', null, Arguments, Output> {
  const { help, args: argHelp } = getFunctionHelp().palette;

  return {
    name: 'palette',
    aliases: [],
    type: 'palette',
    inputTypes: ['null'],
    help,
    args: {
      color: {
        aliases: ['_'],
        multi: true,
        types: ['string'],
        help: argHelp.color,
      },
      gradient: {
        types: ['boolean'],
        default: false,
        help: argHelp.gradient,
        options: [true, false],
      },
      reverse: {
        types: ['boolean'],
        default: false,
        help: argHelp.reverse,
        options: [true, false],
      },
    },
    fn: (input, args, context) => {
      let colors: string[] = paulTor14.colors;
      const { color, reverse } = args;
      let { gradient } = args;

      if (color) {
        colors = color;
      } else {
        const theme = context.variables.theme;
        const workpadPalette = theme?.palette;

        if (workpadPalette) {
          colors = workpadPalette.colors;
          gradient = workpadPalette.gradient;
        }
      }

      return {
        type: 'palette',
        colors: reverse ? colors.reverse() : colors,
        gradient,
      };
    },
  };
}
