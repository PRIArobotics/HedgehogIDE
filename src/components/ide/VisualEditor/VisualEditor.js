// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Blockly from 'blockly';
import 'blockly/python';

import IconButton from '@material-ui/core/IconButton';
import { styled } from '@material-ui/styles';

import {
  ExecuteIcon,
  TerminateIcon,
  SlideLeftIcon,
  SlideRightIcon,
  LanguageJavascriptIcon,
  LanguagePythonIcon,
} from '../../misc/palette';

import s from './VisualEditor.scss';

import './blocks/hedgehog_msg_en';
import './blocks/async_procedures_js';
import {
  HEDGEHOG_MOVE,
  HEDGEHOG_MOVE_UNLIMITED,
  HEDGEHOG_MOTOR_OFF,
  HEDGEHOG_BRAKE,
  HEDGEHOG_MOVE2,
  HEDGEHOG_MOVE2_UNLIMITED,
  HEDGEHOG_MOTOR_OFF2,
  HEDGEHOG_BRAKE2,
  HEDGEHOG_SERVO,
  HEDGEHOG_SERVO_OFF,
  HEDGEHOG_READ_ANALOG,
  HEDGEHOG_READ_DIGITAL,
  HEDGEHOG_SLEEP,
} from './blocks/hedgehog';
import PrintBlock from './blocks/PrintBlock';

const blocks = [
  HEDGEHOG_MOVE,
  HEDGEHOG_MOVE_UNLIMITED,
  HEDGEHOG_MOTOR_OFF,
  HEDGEHOG_BRAKE,
  HEDGEHOG_MOVE2,
  HEDGEHOG_MOVE2_UNLIMITED,
  HEDGEHOG_MOTOR_OFF2,
  HEDGEHOG_BRAKE2,
  HEDGEHOG_SERVO,
  HEDGEHOG_SERVO_OFF,
  HEDGEHOG_READ_ANALOG,
  HEDGEHOG_READ_DIGITAL,
  HEDGEHOG_SLEEP,
  PrintBlock,
];
blocks.forEach(block => {
  const { type } = block.blockJson;

  Blockly.Blocks[type] = {
    init() {
      this.jsonInit(block.blockJson);
    },
  };
  Blockly.JavaScript[type] = block.generators.JavaScript;
  Blockly.Python[type] = block.generators.Python;
});

export type ControlledState = $Shape<{|
  codeCollapsed: boolean,
  codeLanguage: 'JavaScript' | 'Python',
|}>;

type PropTypes = {|
  content: string | null,
  onContentChange: (content: string) => void | Promise<void>,
  codeCollapsed: boolean,
  codeLanguage: 'JavaScript' | 'Python',
  onUpdate: (state: ControlledState) => void | Promise<void>,
  onExecute: (code: string) => void | Promise<void>,
  onTerminate: () => void | Promise<void>,
  running: boolean,
  layoutNode: any,
|};
type StateTypes = {|
  code: string | null,
|};

const ColoredIconButton = styled(({ color, ...other }) => (
  <IconButton {...other} />
))({
  color: props => props.color,
  padding: '4px',
});

class VisualEditor extends React.Component<PropTypes, StateTypes> {
  static defaultProps = {
    codeCollapsed: true,
    codeLanguage: 'JavaScript',
  };

  containerRef: RefObject<'div'> = React.createRef();
  blocklyRef: RefObject<'div'> = React.createRef();
  codeRef: RefObject<'pre'> = React.createRef();
  workspace: Blockly.Workspace | null = null;

  resizeAnim: IntervalID | null;

  state = {
    code: null,
  };

  componentDidMount() {
    // eslint-disable-next-line no-throw-literal
    if (this.codeRef.current === null) throw 'ref is null in componentDidMount';
    const codeRefCurrent = this.codeRef.current;

    const { layoutNode } = this.props;
    layoutNode.setEventListener('resize', this.handleResize);
    layoutNode.setEventListener('visibility', this.handleVisibilityChange);
    codeRefCurrent.addEventListener('transitionend', () => {
      if (this.resizeAnim) clearInterval(this.resizeAnim);
      this.refreshSize();
      if (!this.props.codeCollapsed && this.codeRef.current !== null)
        this.codeRef.current.style.overflow = 'auto';
    });
  }

  // TODO remove blockly in componentWillUnmount

  componentDidUpdate(prevProps) {
    const { content: prevContent, codeLanguage: prevCodeLanguage } = prevProps;
    const { content, codeLanguage } = this.props;

    if (prevContent === null && content !== null) {
      // load contents only once
      this.initializeBlockly(content);
    }

    // refresh code when language is changed
    if (prevCodeLanguage !== codeLanguage) this.refreshCode();
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
    });

    try {
      if (workspaceXml !== '')
        Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(workspaceXml),
          workspace,
        );
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
        <category name="Drive" colour="120">
          {HEDGEHOG_MOVE2_UNLIMITED.toolboxBlocks.default()}
          {HEDGEHOG_MOTOR_OFF2.toolboxBlocks.default()}
          {HEDGEHOG_BRAKE2.toolboxBlocks.default()}
          {HEDGEHOG_MOVE2.toolboxBlocks.default()}
          {HEDGEHOG_SLEEP.toolboxBlocks.default()}
        </category>
        <category name="Motors" colour="120">
          {HEDGEHOG_MOVE_UNLIMITED.toolboxBlocks.default()}
          {HEDGEHOG_MOTOR_OFF.toolboxBlocks.default()}
          {HEDGEHOG_BRAKE.toolboxBlocks.default()}
          {HEDGEHOG_MOVE.toolboxBlocks.default()}
          {HEDGEHOG_SLEEP.toolboxBlocks.default()}
        </category>
        <category name="Servos" colour="120">
          {HEDGEHOG_SERVO.toolboxBlocks.default()}
          {HEDGEHOG_SERVO_OFF.toolboxBlocks.default()}
        </category>
        <category name="Sensors" colour="120">
          {HEDGEHOG_READ_DIGITAL.toolboxBlocks.default()}
          {HEDGEHOG_READ_ANALOG.toolboxBlocks.default()}
          {HEDGEHOG_READ_ANALOG.toolboxBlocks.comparison()}
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

  refreshCode() {
    // eslint-disable-next-line no-throw-literal
    if (this.workspace === null) throw 'unreachable';

    const { workspace } = this;

    const language = Blockly[this.props.codeLanguage];
    const code = language.workspaceToCode(workspace);
    this.setState({ code });
  }

  handleWorkspaceChange() {
    // eslint-disable-next-line no-throw-literal
    if (this.workspace === null) throw 'unreachable';

    const { workspace } = this;

    this.refreshCode();

    const workspaceXml = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspace),
    );
    this.props.onContentChange(workspaceXml);
  }

  setCodeLanguage(codeLanguage: 'JavaScript' | 'Python') {
    this.props.onUpdate({ codeLanguage });
  }

  handleToggleCodeCollapsed = () => {
    this.props.onUpdate({ codeCollapsed: !this.props.codeCollapsed });
    if (this.codeRef.current !== null)
      this.codeRef.current.style.overflow = 'hidden';
    // TODO requestAnimationFrame?
    this.resizeAnim = setInterval(() => this.refreshSize(), 17);
  };

  render() {
    const { codeLanguage } = this.props;
    const { code } = this.state;

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
              <TerminateIcon />
            </ColoredIconButton>
          ) : (
            <ColoredIconButton
              onClick={() => {
                if (code !== null) this.props.onExecute(code);
              }}
              disableRipple
              color="limegreen"
              disabled={code === null || codeLanguage !== 'JavaScript'}
            >
              <ExecuteIcon />
            </ColoredIconButton>
          )}
          <br />
          <ColoredIconButton
            onClick={this.handleToggleCodeCollapsed}
            disableRipple
          >
            {this.props.codeCollapsed ? <SlideLeftIcon /> : <SlideRightIcon />}
          </ColoredIconButton>
          <br />
          <br />
          <ColoredIconButton
            onClick={() => this.setCodeLanguage('JavaScript')}
            disableRipple
            color={codeLanguage === 'JavaScript' ? 'black' : 'gray'}
          >
            <LanguageJavascriptIcon />
          </ColoredIconButton>
          <br />
          <ColoredIconButton
            onClick={() => this.setCodeLanguage('Python')}
            disableRipple
            color={codeLanguage === 'Python' ? 'black' : 'gray'}
          >
            <LanguagePythonIcon />
          </ColoredIconButton>
        </div>
        <pre
          ref={this.codeRef}
          className={
            this.props.codeCollapsed
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
