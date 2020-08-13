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

/**
 * `BlocklyComponent` wraps the `Blockly` npm distribution to make it easily usable within Hedgehog
 * Cloud's requirements. In particular, Blockly editors are shown inside a flex layout, which may
 * resize and hide its tabs. Blockly needs to be told to resize its canvas to the container when a
 * resize happens, and to hide its "chaff" (pop-ups etc.) when it becomes invisible. The consumer of
 * this component is responsible for listening to the relevant events, and call the display update
 * methods of this component accordingly.
 *
 * This component also dynamically handles the localization of Blockly. While `rtl` (right-to-left
 * orientation) is a property of the workspace, localization messages are set globally and applied
 * to a workspace on creation. To dynamically change of the locale, this component will re-inject a
 * new Blockly workspace after setting the translation globally. This has the side effect of
 * clearing any undo history up to that point.
 *
 * Finally, this component allows listening to Blockly's zoom and scroll state, and can restore zoom
 * and scroll state on load.
 */
class BlocklyComponent extends React.Component<PropTypes, StateTypes> {
  // the container is layed out normally by the browser, and is the reference for sizing Blockly
  containerRef: RefObject<'div'> = React.createRef();
  // the blockly div is not layed out and is sized manually
  blocklyRef: RefObject<'div'> = React.createRef();
  // the actual Blockly workspace
  workspace: Blockly.Workspace | null = null;

  componentDidMount() {
    // eslint-disable-next-line no-throw-literal
    if (this.blocklyRef.current === null) throw 'ref is null';
    this.props.forwardedRef.current = this;

    const { initialWorkspaceXml } = this.props;

    const dom = initialWorkspaceXml !== '' ? Blockly.Xml.textToDom(initialWorkspaceXml) : null;
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
      // re-inject workspace. this clears the undo-history, but should work otherwise
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

  /**
   * Resizes the workspace to the dimensions of the component's container div
   */
  refreshSize() {
    const container = this.containerRef.current;
    const blockly = this.blocklyRef.current;
    if (container === null || blockly === null || this.workspace === null) return;

    blockly.style.width = `${container.offsetWidth}px`;
    blockly.style.height = `${container.offsetHeight}px`;
    Blockly.svgResize(this.workspace);
  }

  /**
   * Refreshes the workspace size on the next tick of the event loop
   */
  refreshSizeDeferred() {
    setTimeout(() => this.refreshSize(), 0);
  }

  /**
   * Handles a visibility change of the workspace. When hiding, hides the "chaff"; when showing,
   * refreshes the workspace size.
   */
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
