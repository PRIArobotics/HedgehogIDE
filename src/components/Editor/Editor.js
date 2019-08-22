/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// @flow

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import AceEditor from 'react-ace';

import s from './Editor.scss';

type AceState = any;

type PropTypes = {|
  callbackSave: (state: AceState) => void,
  callbackGet: () => AceState,
|};
type StateTypes = {|
  width: string,
  height: string,
|};

class Editor extends React.Component<PropTypes, StateTypes> {
  value: AceState;

  state = {
    width: 0,
    height: 0,
  };

  constructor(props: PropTypes) {
    super(props);
    this.value = this.props.callbackGet();
  }

  componentDidMount() {
    this.setState({ width: '100%' });
    this.setState({ height: '100%' });
  }

  onChange = (newValue: AceState) => {
    this.value = newValue;
    this.props.callbackSave(this.value);
  };

  render() {
    return (
      <AceEditor
        mode="javascript"
        name="editor"
        width={this.state.width}
        height={this.state.height}
        // onLoad={this.onLoad}
        onChange={this.onChange}
        fontSize={16}
        // onSelectionChange={this.onSelectionChange}
        // onCursorChange={this.onCursorChange}
        // onValidate={this.onValidate}
        value={this.value}
        showGutter
        highlightActiveLine
        autoScrollEditorIntoView
        style={{
          position: 'absolute',
        }}
        setOptions={{
          enableBasicAutocompletion: true,
          // enableLiveAutocompletion: true,
          // enableSnippets: this.state.enableSnippets,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    );
  }
}

export default withStyles(s)(Editor);
