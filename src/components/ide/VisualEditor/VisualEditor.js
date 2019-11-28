// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Blockly from 'blockly';

import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import StopIcon from '@material-ui/icons/Stop';
import { styled } from '@material-ui/styles';

import s from './VisualEditor.scss';

import MoveBlock from './blocks/MoveBlock';
import SleepBlock from './blocks/SleepBlock';
import PrintBlock from './blocks/PrintBlock';

const blocks = [MoveBlock, PrintBlock, SleepBlock];
blocks.forEach(block => {
  const { type } = block.blockJson;

  Blockly.Blocks[type] = {
    init() {
      this.jsonInit(block.blockJson);
    },
  };
  Blockly.JavaScript[type] = block.generators.JavaScript;
});

export type ControlledState = $Shape<{|
  workspaceXml: string,
  codeCollapsed: boolean,
|}>;

type PropTypes = {|
  workspaceXml: string,
  codeCollapsed: boolean,
  onUpdate: (state: ControlledState) => void | Promise<void>,
  onExecute: (code: string) => void | Promise<void>,
  onTerminate: () => void | Promise<void>,
  running: boolean,
  layoutNode: any,
|};
type StateTypes = {||};

const ColoredIconButton = styled(({ color, ...other }) => (
  <IconButton {...other} />
))({
  color: props => props.color,
  padding: '4px',
});

class VisualEditor extends React.Component<PropTypes, StateTypes> {
  containerRef: RefObject<'div'> = React.createRef();
  blocklyRef: RefObject<'div'> = React.createRef();
  codeRef: RefObject<'pre'> = React.createRef();
  workspace: Blockly.Workspace | null = null;

  resizeAnim: IntervalID | null;
  code: string = '';

  componentDidMount() {
    // eslint-disable-next-line no-throw-literal
    if (this.codeRef.current === null) throw 'ref is null in componentDidMount';
    // eslint-disable-next-line no-throw-literal
    if (this.blocklyRef.current === null) throw 'ref is null';
    const codeRefCurrent = this.codeRef.current;

    const workspace = Blockly.inject(this.blocklyRef.current, {
      toolbox: this.createToolbox(),
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
    });

    const { workspaceXml } = this.props;
    if (workspaceXml) {
      Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(workspaceXml),
        workspace,
      );
    }

    workspace.addChangeListener(() => this.workspaceUpdater());

    const { layoutNode } = this.props;
    layoutNode.setEventListener('resize', this.handleResize);
    layoutNode.setEventListener('visibility', this.handleVisibilityChange);
    codeRefCurrent.addEventListener('transitionend', () => {
      if (this.resizeAnim) clearInterval(this.resizeAnim);
      this.refreshSize();
      if (!this.props.codeCollapsed && this.codeRef.current !== null)
        this.codeRef.current.style.overflow = 'auto';
    });

    this.workspace = workspace;
    this.refreshSize();
  }

  createToolbox(): string {
    const toolbox = (
      <xml>
        <category name="Hedgehog" colour="120">
          {MoveBlock.toolboxBlocks.default()}
          {SleepBlock.toolboxBlocks.default()}
        </category>
        <sep />
        <category name="Logic" colour="%{BKY_LOGIC_HUE}">
          <block type="controls_if" />
          <block type="controls_if">
            <mutation else="1" />
          </block>
          <block type="controls_if">
            <mutation elseif="1" else="1" />
          </block>
          <block type="logic_compare" />
          <block type="logic_operation" />
          <block type="logic_negate" />
          <block type="logic_boolean" />
          <block type="logic_null" />
          <block type="logic_ternary" />
        </category>
        <category name="Loops" colour="%{BKY_LOOPS_HUE}">
          <block type="controls_repeat_ext">
            <value name="TIMES">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
          <block type="controls_whileUntil" />
          <block type="controls_for">
            <field name="VAR">i</field>
            <value name="FROM">
              <block type="math_number">
                <field name="NUM">1</field>
              </block>
            </value>
            <value name="TO">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
            <value name="BY">
              <block type="math_number">
                <field name="NUM">1</field>
              </block>
            </value>
          </block>
          <block type="controls_forEach" />
          <block type="controls_flow_statements" />
        </category>
        <category name="Math" colour="%{BKY_MATH_HUE}">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
          <block type="math_arithmetic" />
          <block type="math_single" />
          <block type="math_trig" />
          <block type="math_constant" />
          <block type="math_number_property" />
          <block type="math_round" />
          <block type="math_on_list" />
          <block type="math_modulo" />
          <block type="math_constrain">
            <value name="LOW">
              <block type="math_number">
                <field name="NUM">1</field>
              </block>
            </value>
            <value name="HIGH">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
          <block type="math_random_int">
            <value name="FROM">
              <block type="math_number">
                <field name="NUM">1</field>
              </block>
            </value>
            <value name="TO">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
          <block type="math_random_float" />
          <block type="math_atan2" />
        </category>
        <category name="Lists" colour="%{BKY_LISTS_HUE}">
          <block type="lists_create_empty" />
          <block type="lists_create_with" />
          <block type="lists_repeat">
            <value name="NUM">
              <block type="math_number">
                <field name="NUM">5</field>
              </block>
            </value>
          </block>
          <block type="lists_length" />
          <block type="lists_isEmpty" />
          <block type="lists_indexOf" />
          <block type="lists_getIndex" />
          <block type="lists_setIndex" />
        </category>
        <sep />
        <category
          name="Variables"
          custom="VARIABLE"
          colour="%{BKY_VARIABLES_HUE}"
        />
        <category
          name="Functions"
          custom="PROCEDURE"
          colour="%{BKY_PROCEDURES_HUE}"
        />
        <category name="Text" colour="70">
          {PrintBlock.toolboxBlocks.default()}
          <block type="text" />
        </category>
      </xml>
    );
    return ReactDOM.renderToStaticMarkup(toolbox);
  }

  handleResize = () => {
    this.refreshSize();
  };

  handleVisibilityChange = ({ visible }) => {
    if (visible) {
      this.refreshSize();
    } else {
      Blockly.hideChaff();
    }
  };

  refreshSize() {
    setTimeout(() => {
      const container = this.containerRef.current;
      const blockly = this.blocklyRef.current;
      if (container === null || blockly === null || this.workspace === null)
        return;

      blockly.style.width = `${container.offsetWidth}px`;
      blockly.style.height = `${container.offsetHeight}px`;
      Blockly.svgResize(this.workspace);
    }, 0);
  }

  workspaceUpdater() {
    // eslint-disable-next-line no-throw-literal
    if (this.codeRef.current === null) throw 'ref is null';
    // eslint-disable-next-line no-throw-literal
    if (this.workspace === null) throw 'unreachable';

    const codeRefCurrent = this.codeRef.current;
    const { workspace } = this;

    this.code = Blockly.JavaScript.workspaceToCode(workspace);
    codeRefCurrent.innerHTML = this.code;

    const workspaceXml = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspace),
    );
    this.props.onUpdate({ workspaceXml });
  }

  handleToggleCodeCollapsed = () => {
    this.props.onUpdate({ codeCollapsed: !this.props.codeCollapsed });
    if (this.codeRef.current !== null)
      this.codeRef.current.style.overflow = 'hidden';
    // TODO requestAnimationFrame?
    this.resizeAnim = setInterval(() => this.refreshSize(), 17);
  };

  render() {
    return (
      <div className={s.tabRoot}>
        <div ref={this.containerRef} className={s.blocklyContainer}>
          <div ref={this.blocklyRef} className={s.blockly} />
        </div>
        <div className={s.sidebar}>
          {this.props.running ? (
            <ColoredIconButton
              onClick={() => this.props.onTerminate()}
              disableRipple
              color="red"
            >
              <StopIcon />
            </ColoredIconButton>
          ) : (
            <ColoredIconButton
              onClick={() => this.props.onExecute(this.code)}
              disableRipple
              color="limegreen"
            >
              <PlayArrowIcon />
            </ColoredIconButton>
          )}
          <br />
          <ColoredIconButton
            onClick={this.handleToggleCodeCollapsed}
            disableRipple
          >
            {this.props.codeCollapsed ? (
              <KeyboardArrowLeftIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
          </ColoredIconButton>
        </div>
        <pre
          ref={this.codeRef}
          className={
            this.props.codeCollapsed
              ? `${s.codeContainer} ${s.collapsed}`
              : s.codeContainer
          }
        />
      </div>
    );
  }
}

export default withStyles(s)(VisualEditor);
