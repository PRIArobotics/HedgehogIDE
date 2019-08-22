// @flow

import React from 'react';
import type { Node } from 'react';

type PropTypes = {|
  children: () => Promise<Node>,
|};
type StateTypes = {|
  children: Node | null,
|};

class NoSSR extends React.Component<PropTypes, StateTypes> {
  state = {
    children: null,
  };

  componentDidMount() {
    if (process.env.BROWSER) {
      this.props.children().then(children => {
        this.setState({
          children,
        });
      });
    }
  }

  render() {
    return this.state.children;
  }
}

export default NoSSR;
