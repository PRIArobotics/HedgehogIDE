// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Blockly from 'blockly';

import IconButton from '@material-ui/core/IconButton';

import { SlideLeftIcon, SlideRightIcon } from '../../misc/palette';

import BlocklyComponent from '../Blockly';
import ToolBar from '../ToolBar';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './SimulatorEditor.scss';

import * as SimulationSchema from './SimulationSchema';

import {
  SIMULATOR_ROOT,
  SIMULATOR_RECT,
  SIMULATOR_CIRCLE,
  SIMULATOR_ROBOT,
  SIMULATOR_SETTINGS_TRANSLATE,
  SIMULATOR_SETTINGS_ROTATE,
  SIMULATOR_SETTINGS_COLOR,
  SIMULATOR_SETTINGS_STATIC,
  SIMULATOR_SETTINGS_SENSOR,
  SIMULATOR_SETTINGS_DENSITY,
  SIMULATOR_SETTINGS_FRICTION_AIR,
  SIMULATOR_GROUP,
} from './blocks';

const blocks = [
  SIMULATOR_ROOT,
  SIMULATOR_RECT,
  SIMULATOR_CIRCLE,
  SIMULATOR_ROBOT,
  SIMULATOR_SETTINGS_TRANSLATE,
  SIMULATOR_SETTINGS_ROTATE,
  SIMULATOR_SETTINGS_COLOR,
  SIMULATOR_SETTINGS_STATIC,
  SIMULATOR_SETTINGS_SENSOR,
  SIMULATOR_SETTINGS_DENSITY,
  SIMULATOR_SETTINGS_FRICTION_AIR,
  SIMULATOR_GROUP,
];
blocks.forEach(block => {
  const { type } = block.blockJson;

  Blockly.Blocks[type] = {
    init() {
      this.jsonInit(block.blockJson);
    },
    ...block.blockExtras,
  };
});

export type ControlledState = $Shape<{|
  jsonCollapsed: boolean,
|}>;

type PropTypes = {|
  content: string | null,
  onContentChange: (
    content: string,
    schema: SimulationSchema.SimulatorJson | null,
  ) => void | Promise<void>,
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

  static blocklyWorkspaceOptions = (() => {
    const toolbox = ReactDOM.renderToStaticMarkup(
      <xml>
        <category name="Simulation" colour="120">
          {SIMULATOR_ROOT.toolboxBlocks.default()}
          {SIMULATOR_RECT.toolboxBlocks.default()}
          {SIMULATOR_CIRCLE.toolboxBlocks.default()}
          {SIMULATOR_GROUP.toolboxBlocks.default()}
          {SIMULATOR_SETTINGS_TRANSLATE.toolboxBlocks.default()}
          {SIMULATOR_SETTINGS_ROTATE.toolboxBlocks.default()}
          {SIMULATOR_SETTINGS_COLOR.toolboxBlocks.default()}
          {SIMULATOR_SETTINGS_STATIC.toolboxBlocks.default()}
          {SIMULATOR_SETTINGS_SENSOR.toolboxBlocks.default()}
          {SIMULATOR_SETTINGS_DENSITY.toolboxBlocks.default()}
          {SIMULATOR_SETTINGS_FRICTION_AIR.toolboxBlocks.default()}
          {SIMULATOR_ROBOT.toolboxBlocks.default()}
        </category>
      </xml>,
    );
    return {
      toolbox,
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
    };
  })();

  blocklyRef: RefObject<BlocklyComponent> = React.createRef();
  jsonRef: RefObject<'pre'> = React.createRef();

  resizeAnim: AnimationFrameID | null;

  state = {
    json: null,
  };

  componentDidMount() {
    // eslint-disable-next-line no-throw-literal
    if (this.jsonRef.current === null) throw 'ref is null in componentDidMount';
    const jsonRefCurrent = this.jsonRef.current;

    const { layoutNode } = this.props;
    layoutNode.setEventListener('resize', () => {
      if (this.blocklyRef.current)
        this.blocklyRef.current.refreshSizeDeferred();
    });
    layoutNode.setEventListener('visibility', ({ visible }) => {
      if (this.blocklyRef.current)
        this.blocklyRef.current.updateVisibility(visible);
    });
    jsonRefCurrent.addEventListener('transitionend', () => {
      if (this.resizeAnim) {
        cancelAnimationFrame(this.resizeAnim);
        this.resizeAnim = null;
      }

      if (this.blocklyRef.current)
        this.blocklyRef.current.refreshSizeDeferred();
    });
  }

  animateWorkspaceSize() {
    this.resizeAnim = requestAnimationFrame(() => {
      if (this.blocklyRef.current) this.blocklyRef.current.refreshSize();
      this.animateWorkspaceSize();
    });
  }

  getSchema(): SimulationSchema.SimulatorJson | null {
    // eslint-disable-next-line no-throw-literal
    if (this.blocklyRef.current === null) throw 'ref is null';

    const { workspace } = this.blocklyRef.current;

    const roots = workspace.getBlocksByType('simulator_root');
    if (roots.length !== 1) return null;

    const [simulation] = roots;
    return simulation.serialize();
  }

  refreshJson(schema: SimulationSchema.SimulatorJson | null) {
    const json = schema === null ? '' : JSON.stringify(schema, undefined, 2);
    this.setState({ json });
  }

  handleBlocklyChange = workspace => {
    const schema = this.getSchema();
    this.refreshJson(schema);

    const workspaceXml = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspace),
    );
    this.props.onContentChange(workspaceXml, schema);
  };

  handleToggleJsonCollapsed = () => {
    this.props.onUpdate({ jsonCollapsed: !this.props.jsonCollapsed });
    this.animateWorkspaceSize();
  };

  render() {
    const { content, jsonCollapsed } = this.props;
    const { json } = this.state;

    return (
      <div className={s.tabRoot}>
        {content === null ? null : (
          <BlocklyComponent
            forwardedRef={this.blocklyRef}
            initialWorkspaceXml={content}
            workspaceOptions={VisualEditor.blocklyWorkspaceOptions}
            onChange={this.handleBlocklyChange}
          />
        )}
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
              ? `${s.jsonContainer} ${s.collapsed}`
              : s.jsonContainer
          }
        >
          {json}
        </pre>
      </div>
    );
  }
}

export default withStyles(s)(VisualEditor);
