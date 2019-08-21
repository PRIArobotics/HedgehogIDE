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

type PropTypes = {||};
type StateTypes = {||};

class Editor extends React.Component<PropTypes, StateTypes> {

  constructor(props) {
    super(props);
    this.value = this.props.callbackGet(this.props.id);
  }

  onChange = newValue => {
    this.value = newValue;
    this.props.callbackSave(this.value, this.props.id);
  };

  render() {
    return (
      <AceEditor
        mode="javascript"
        width="100%"
        height="100%"
        // onLoad={this.onLoad}
        onChange={this.onChange}
        // onSelectionChange={this.onSelectionChange}
        // onCursorChange={this.onCursorChange}
        // onValidate={this.onValidate}
        value={this.value}
        showGutter
        highlightActiveLine
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
