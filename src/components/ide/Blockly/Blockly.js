// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Blockly from 'blockly';

import s from './Blockly.scss';

type PropTypes = {|
  // eslint-disable-next-line no-use-before-define
  forwardedRef: RefObject<typeof BlocklyComponent>,
  initialWorkspaceXml: string,
  workspaceOptions?: Object,
  onChange: (workspace: Blockly.Workspace) => void | Promise<void>,
|};
type StateTypes = {||};

class BlocklyComponent extends React.Component<PropTypes, StateTypes> {
  containerRef: RefObject<'div'> = React.createRef();
  blocklyRef: RefObject<'div'> = React.createRef();
  workspace: Blockly.Workspace | null = null;

  componentDidMount() {
    // eslint-disable-next-line no-throw-literal
    if (this.blocklyRef.current === null) throw 'ref is null';
    this.props.forwardedRef.current = this;

    const { initialWorkspaceXml, workspaceOptions } = this.props;

    const workspace = Blockly.inject(this.blocklyRef.current, workspaceOptions);

    try {
      if (initialWorkspaceXml !== '') {
        Blockly.Xml.clearWorkspaceAndLoadFromXml(
          Blockly.Xml.textToDom(initialWorkspaceXml),
          workspace,
        );
        workspace.clearUndo();
      }
    } catch (ex) {
      console.warn(ex);
    }

    workspace.addChangeListener(() => {
      // eslint-disable-next-line no-throw-literal
      if (this.workspace === null) throw 'unreachable';

      this.props.onChange(this.workspace);
    });

    this.workspace = workspace;
    this.refreshSize();
  }

  // TODO remove blockly in componentWillUnmount

  refreshSize() {
    const container = this.containerRef.current;
    const blockly = this.blocklyRef.current;
    if (container === null || blockly === null || this.workspace === null)
      return;

    blockly.style.width = `${container.offsetWidth}px`;
    blockly.style.height = `${container.offsetHeight}px`;
    Blockly.svgResize(this.workspace);
  }

  refreshSizeDeferred() {
    setTimeout(() => this.refreshSize(), 0);
  }

  updateVisibility(visible: boolean) {
    if (visible) {
      this.refreshSizeDeferred();
    } else {
      Blockly.hideChaff();
    }
  }

  render() {
    return (
      <div ref={this.containerRef} className={s.blocklyContainer}>
        <div ref={this.blocklyRef} className={s.blockly} />
      </div>
    );
  }
}

export default withStyles(s)(BlocklyComponent);
