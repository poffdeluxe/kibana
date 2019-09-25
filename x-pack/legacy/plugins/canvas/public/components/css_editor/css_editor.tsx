/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { CodeEditor } from '../../../../../../../src/plugins/kibana_react/public';

import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js';

interface Props {
  /** Value of CSS */
  value: string;
  /** Function invoked when CSS value is changed */
  onChange: (value?: string) => void;
}

export class CSSEditor extends React.Component<Props> {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    // Updating tab size for the editor
    const model = editor.getModel();
    if (model) {
      model.updateOptions({ tabSize: 2 });
    }
  };

  render() {
    const { value, onChange } = this.props;

    return (
      <Fragment>
        <CodeEditor
          languageId="css"
          value={value}
          onChange={onChange}
          options={{
            scrollBeyondLastLine: false,
            quickSuggestions: true,
            minimap: {
              enabled: false,
            },
            wordBasedSuggestions: false,
            wordWrap: 'on',
            wrappingIndent: 'indent',
          }}
          editorDidMount={this.editorDidMount}
          height={200}
        />
      </Fragment>
    );
  }
}
