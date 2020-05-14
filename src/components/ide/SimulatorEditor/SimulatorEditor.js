// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import withStyles from 'isomorphic-style-loader/withStyles';

import Blockly from 'blockly/core';

import { LocaleConsumer } from '../../locale';
import { type LocaleMap, getTranslation } from '../../../translations';

import { SlideLeftIcon, SlideRightIcon } from '../../misc/palette';

import BlocklyComponent, { type Locale as BlocklyLocale } from '../Blockly';
import ToolBar from '../ToolBar';
import ToolBarIconButton from '../ToolBar/ToolBarIconButton';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './SimulatorEditor.scss';

import * as SimulationSchema from './SimulationSchema';

import * as blocks from './blocks';

// TODO translate simulator editor
const LOCALES: LocaleMap<BlocklyLocale> = {
  en: {
    rtl: false,
    msg: {},
  },
};

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
          {blocks.SIMULATOR_ROOT.toolboxBlocks.default()}
          {blocks.SIMULATOR_RECT.toolboxBlocks.default()}
          {blocks.SIMULATOR_CIRCLE.toolboxBlocks.default()}
          {blocks.SIMULATOR_GROUP.toolboxBlocks.default()}
          {blocks.SIMULATOR_SETTINGS_TRANSLATE.toolboxBlocks.default()}
          {blocks.SIMULATOR_SETTINGS_ROTATE.toolboxBlocks.default()}
          {blocks.SIMULATOR_SETTINGS_COLOR.toolboxBlocks.default()}
          {blocks.SIMULATOR_SETTINGS_STATIC.toolboxBlocks.default()}
          {blocks.SIMULATOR_SETTINGS_SENSOR.toolboxBlocks.default()}
          {blocks.SIMULATOR_SETTINGS_DENSITY.toolboxBlocks.default()}
          {blocks.SIMULATOR_SETTINGS_FRICTION_AIR.toolboxBlocks.default()}
          {blocks.SIMULATOR_SETTINGS_LABEL.toolboxBlocks.default()}
          {blocks.SIMULATOR_ROBOT.toolboxBlocks.default()}
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
          <LocaleConsumer>
            {({ preferredLocales }) => {
              const locale =
                getTranslation(preferredLocales, LOCALES) || LOCALES.en;

              return (
                <BlocklyComponent
                  forwardedRef={this.blocklyRef}
                  initialWorkspaceXml={content}
                  locale={locale}
                  workspaceOptions={VisualEditor.blocklyWorkspaceOptions}
                  onChange={this.handleBlocklyChange}
                />
              );
            }}
          </LocaleConsumer>
        )}
        <ToolBar>
          <ToolBarItem>
            <ToolBarIconButton
              onClick={this.handleToggleJsonCollapsed}
              icon={jsonCollapsed ? SlideLeftIcon : SlideRightIcon}
              disableRipple
            />
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
