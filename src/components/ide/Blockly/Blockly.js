// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import Blockly from 'blockly/core';

import s from './Blockly.scss';

type Locale = {|
  rtl: boolean,
  msg: { [string]: string },
|};

type PropTypes = {|
  // eslint-disable-next-line no-use-before-define
  forwardedRef: RefObject<typeof BlocklyComponent>,
  initialWorkspaceXml: string,
  locale: Locale,
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

    const { initialWorkspaceXml, locale, workspaceOptions } = this.props;

    this.injectWorkspace(
      locale,
      workspaceOptions,
      Blockly.Xml.textToDom(initialWorkspaceXml),
    );

    this.refreshSize();
  }

  componentWillUnmount() {
    if (this.workspace === null) return;

    this.workspace.dispose();
    this.workspace = null;
  }

  componentDidUpdate(prevProps) {
    const {
      locale: { rtl: prevRtl, msg: prevMsg },
    } = prevProps;
    const { locale, workspaceOptions } = this.props;

    // eslint-disable-next-line no-throw-literal
    if (this.workspace === null) return;
    const { workspace } = this;

    if (locale.rtl !== prevRtl || locale.msg !== prevMsg) {
      const dom = Blockly.Xml.workspaceToDom(workspace);
      workspace.dispose();
      this.injectWorkspace(locale, workspaceOptions, dom);
    }
  }

  injectWorkspace({ rtl, msg }: Locale, options: Object, dom) {
    // eslint-disable-next-line no-throw-literal
    if (this.blocklyRef.current === null) throw 'ref is null';

    Blockly.setLocale(msg);
    const workspace = Blockly.inject(this.blocklyRef.current, {
      ...options,
      rtl,
    });

    try {
      // don't record this reloading of the workspace for undo
      Blockly.Events.recordUndo = false;

      Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);

      Blockly.Events.recordUndo = true;
    } catch (ex) {
      console.warn(ex);
    }

    workspace.addChangeListener(() => {
      // eslint-disable-next-line no-throw-literal
      if (this.workspace === null) throw 'unreachable';

      this.props.onChange(this.workspace);
    });

    this.workspace = workspace;
  }

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
