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

import s from './Editor.css';

const importer = (async () => {
  if (!process.env.BROWSER) {
    // never resolves
    await new Promise(() => {});
  }

  // import ace editor
  return {
    AceEditor: await import('react-ace'),
  };
})();

type PropTypes = {||};
type StateTypes = {|
  aceReady: boolean,
|};

class Editor extends React.Component<PropTypes, StateTypes> {
  constructor(props: PropTypes) {
    super(props);
    this.state = {
      aceReady: false,
    };
  }

  componentDidMount() {
    importer.then(({ AceEditor }) => {
      this.AceEditor = AceEditor;
      this.setState({
        aceReady: true,
      });
    });
  }

  render() {
    return (
      <div>
        {this.state.aceReady && (
          <this.AceEditor.default
            mode="javascript"
            // onLoad={this.onLoad}
            // onChange={this.onChange}
            // onSelectionChange={this.onSelectionChange}
            // onCursorChange={this.onCursorChange}
            // onValidate={this.onValidate}
            value="foo"
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
        )}
      </div>
    );
  }
}

export default withStyles(s)(Editor);
