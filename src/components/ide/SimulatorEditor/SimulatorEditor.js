// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Blockly from 'blockly';

import IconButton from '@material-ui/core/IconButton';

import { SlideLeftIcon, SlideRightIcon } from '../../misc/palette';

import ToolBar from '../ToolBar';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './SimulatorEditor.scss';

export type ControlledState = $Shape<{|
  jsonCollapsed: boolean,
|}>;

type PropTypes = {|
  content: string | null,
  onContentChange: (content: string) => void | Promise<void>,
  jsonCollapsed: boolean,
  onUpdate: (state: ControlledState) => void | Promise<void>,
  layoutNode: any,
|};
type StateTypes = {|
  json: string | null,
|};

class VisualEditor extends React.Component<PropTypes, StateTypes> {
  static defaultProps = {
    jsonCollapsed: true,
  };

  containerRef: RefObject<'div'> = React.createRef();
  blocklyRef: RefObject<'div'> = React.createRef();
  jsonRef: RefObject<'pre'> = React.createRef();
  workspace: Blockly.Workspace | null = null;

  resizeAnim: AnimationFrameID | null;

  state = {
    json: null,
  };

  componentDidMount() {
    // eslint-disable-next-line no-throw-literal
    if (this.jsonRef.current === null) throw 'ref is null in componentDidMount';
    const jsonRefCurrent = this.jsonRef.current;

    const { layoutNode } = this.props;
    layoutNode.setEventListener('resize', this.handleResize);
    layoutNode.setEventListener('visibility', this.handleVisibilityChange);
    jsonRefCurrent.addEventListener('transitionend', () => {
      if (this.resizeAnim) {
        cancelAnimationFrame(this.resizeAnim);
        this.resizeAnim = null;
      }
      this.refreshSize(true);
    });
  }

  // TODO remove blockly in componentWillUnmount

  componentDidUpdate(prevProps) {
    const { content: prevContent } = prevProps;
    const { content } = this.props;

    if (prevContent === null && content !== null) {
      // load contents only once
      this.initializeBlockly(content);
    }
  }

  initializeBlockly(workspaceXml: string) {
    // eslint-disable-next-line no-throw-literal
    if (this.blocklyRef.current === null) throw 'ref is null';

    const workspace = Blockly.inject(this.blocklyRef.current, {
      toolbox: this.createToolbox(),
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
      zoom: {
        controls: false,
        wheel: true,
        startScale: 1.0,
        maxScale: 1.5,
        minScale: 0.4,
        scaleSpeed: 1.02,
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true,
      },
      trashcan: false,
      scrollbars: true,
    });

    try {
      if (workspaceXml !== '') {
        Blockly.Xml.clearWorkspaceAndLoadFromXml(
          Blockly.Xml.textToDom(workspaceXml),
          workspace,
        );
        workspace.clearUndo();
      }
    } catch (ex) {
      console.warn(ex);
    }

    workspace.addChangeListener(() => this.handleWorkspaceChange());

    this.workspace = workspace;
    this.refreshSize();
  }

  createToolbox(): string {
    const toolbox = (
      <xml>
        <block type="controls_if" />
      </xml>
    );
    return ReactDOM.renderToStaticMarkup(toolbox);
  }

  handleResize = () => {
    this.refreshSize(true);
  };

  handleVisibilityChange = ({ visible }) => {
    if (visible) {
      this.refreshSize(true);
    } else {
      Blockly.hideChaff();
    }
  };

  animateWorkspaceSize() {
    this.resizeAnim = requestAnimationFrame(() => {
      this.refreshSize(false);
      this.animateWorkspaceSize();
    });
  }

  refreshSize(deferred: boolean = false) {
    if (deferred) {
      setTimeout(() => this.refreshSize(), 0);
    } else {
      const container = this.containerRef.current;
      const blockly = this.blocklyRef.current;
      if (container === null || blockly === null || this.workspace === null)
        return;

      blockly.style.width = `${container.offsetWidth}px`;
      blockly.style.height = `${container.offsetHeight}px`;
      Blockly.svgResize(this.workspace);
    }
  }

  refreshJson() {
    // eslint-disable-next-line no-throw-literal
    if (this.workspace === null) throw 'unreachable';

    const { workspace } = this;

    const json = '';
    this.setState({ json });
  }

  handleWorkspaceChange() {
    // eslint-disable-next-line no-throw-literal
    if (this.workspace === null) throw 'unreachable';

    const { workspace } = this;

    this.refreshJson();

    const workspaceXml = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspace),
    );
    this.props.onContentChange(workspaceXml);
  }

  handleToggleJsonCollapsed = () => {
    this.props.onUpdate({ jsonCollapsed: !this.props.jsonCollapsed });
    this.animateWorkspaceSize();
  };

  render() {
    const { jsonCollapsed } = this.props;
    const { code } = this.state;

    return (
      <div className={s.tabRoot}>
        <div ref={this.containerRef} className={s.blocklyContainer}>
          <div ref={this.blocklyRef} className={s.blockly} />
        </div>
        <ToolBar>
          <ToolBarItem>
            <IconButton onClick={this.handleToggleJsonCollapsed} disableRipple>
              {jsonCollapsed ? <SlideLeftIcon /> : <SlideRightIcon />}
            </IconButton>
          </ToolBarItem>
        </ToolBar>
        <pre
          ref={this.jsonRef}
          className={
            jsonCollapsed
              ? `${s.codeContainer} ${s.collapsed}`
              : s.codeContainer
          }
        >
          {code}
        </pre>
      </div>
    );
  }
}

export default withStyles(s)(VisualEditor);
