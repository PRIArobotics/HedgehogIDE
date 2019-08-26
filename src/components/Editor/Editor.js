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
  initial: booleam,
|};

class Editor extends React.Component<PropTypes, StateTypes> {
  value: AceState;

  state = {
    initial: true,
  };

  constructor(props: PropTypes) {
    super(props);
    this.value = this.props.callbackGet();
  }

  componentDidMount() {
    this.setState({ initial: false });
  }

  onChange = (newValue: AceState) => {
    this.value = newValue;
    this.props.callbackSave(this.value);
  };

  render() {
    // not rendering directly after the component was mounted
    // somehow fixes a strange display bug.
    if (this.state.initial) return null;

    return (
      <AceEditor
        mode="javascript"
        name="editor"
        width="100%"
        height="100%"
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
