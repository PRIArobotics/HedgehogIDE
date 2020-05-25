// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import Blockly from 'blockly/core';

import s from './Blockly.scss';

export type Locale = {|
  rtl: boolean,
  msg: { [string]: string },
|};

export type WorkspaceTransform = {|
  scrollX: number,
  scrollY: number,
  scale: number,
|};

type PropTypes = {|
  // eslint-disable-next-line no-use-before-define
  forwardedRef: RefObject<typeof BlocklyComponent>,
  initialWorkspaceXml: string,
  locale: Locale,
  workspaceOptions?: Object,
  workspaceTransform?: WorkspaceTransform,
  onChange?: (workspace: Blockly.Workspace) => void | Promise<void>,
  onScroll?: (workspace: Blockly.Workspace) => void | Promise<void>,
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

    const { initialWorkspaceXml } = this.props;

    const dom =
      initialWorkspaceXml !== ''
        ? Blockly.Xml.textToDom(initialWorkspaceXml)
        : null;
    this.injectWorkspace(dom);

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
    const {
      locale: { rtl, msg },
    } = this.props;

    if (this.workspace === null) return;
    const { workspace } = this;

    if (rtl !== prevRtl || msg !== prevMsg) {
      const dom = Blockly.Xml.workspaceToDom(workspace);
      workspace.dispose();
      this.injectWorkspace(dom);
    }
  }

  injectWorkspace(dom) {
    // eslint-disable-next-line no-throw-literal
    if (this.blocklyRef.current === null) throw 'ref is null';

    const {
      locale: { rtl, msg },
      workspaceOptions,
      workspaceTransform,
    } = this.props;

    Blockly.setLocale(msg);
    const workspace = Blockly.inject(this.blocklyRef.current, {
      ...workspaceOptions,
      rtl,
    });

    if (dom !== null) {
      try {
        // don't record this reloading of the workspace for undo
        Blockly.Events.recordUndo = false;

        Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);

        Blockly.Events.recordUndo = true;
      } catch (ex) {
        console.warn(ex);
      }
    }

    workspace.addChangeListener(() => {
      if (this.props.onChange) this.props.onChange(workspace);
    });

    // TODO this is a terrible hack, but there's no scroll event
    // translate is the most fundamental in a set of methods
    // that move and zoom the workspace
    // using an arrow function, so `this` is the component not the workspace
    const translate = workspace.translate.bind(workspace);
    workspace.translate = (x, y) => {
      translate(x, y);
      if (this.props.onScroll) this.props.onScroll(workspace);
    };

    if (workspaceTransform) {
      const { scrollX, scrollY, scale } = workspaceTransform;

      setTimeout(() => {
        workspace.setScale(scale);
        workspace.scroll(scrollX, scrollY);
      }, 0);
    }

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
