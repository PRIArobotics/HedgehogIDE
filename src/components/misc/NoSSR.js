// @flow

import * as React from 'react';

type PropTypes = {|
  children: () => Promise<React.Node>,
|};
type StateTypes = {|
  children: React.Node | null,
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
