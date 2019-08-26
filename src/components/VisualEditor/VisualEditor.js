// @flow

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Blockly from 'blockly';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import StopIcon from '@material-ui/icons/Stop';
import { styled } from '@material-ui/styles';
import jsInterpreter from './interpreter';
import acorn from './acorn';
// eslint-disable-next-line css-modules/no-unused-class
import s from './VisualEditor.scss';
import {Icon} from "@material-ui/core";

global.acorn = acorn;

const printBlock = {
  type: 'text_alert',
  message0: 'output %1',
  args0: [
    {
      type: 'input_value',
      name: 'TEXT',
      check: ['Number', 'String'],
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 70,
  tooltip: 'This is a tooltip',
  helpUrl: '',
};

type BlocklyState = any;

type PropTypes = {|
  layoutNode: any,
  callbackSave: (state: BlocklyState) => void,
  callbackGet: () => BlocklyState,
  callbackCode: (code: string) => void,
|};
type StateTypes = {||};

const ColoredIconButton = styled(({ color, ...other }) => <IconButton {...other} />)({
  color: props => props.color,
  padding: '4px',
});

class VisualEditor extends React.Component<PropTypes, StateTypes> {
  containerRef: React.RefObject = React.createRef();

  blocklyRef: React.RefObject = React.createRef();

  toolboxRef: React.RefObject = React.createRef();

  codeRef: React.RefObject = React.createRef();

  mountPoint: React.RefObject = React.createRef();

  workspace: Blockly.Workspace;

  constructor(props) {
    super(props);
    this.state = { running: false, codeCollapsed: false };
    this.codeCollapsed = false;
  }

  componentDidMount() {
    this.workspace = Blockly.inject(this.blocklyRef.current, {
      toolbox: this.toolboxRef.current,
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
    });
    this.addBlocklyBlocks();

    const workspaceXml = this.props.callbackGet();
    if (workspaceXml) {
      Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(workspaceXml),
        this.workspace,
      );
    }

    this.workspace.addChangeListener(() => this.workspaceUpdater());

    const { layoutNode } = this.props;
    layoutNode.setEventListener('resize', this.handleResize);
    layoutNode.setEventListener('visibility', this.handleVisibilityChange);
    this.refreshSize();
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
      blockly.style.width = `${container.offsetWidth}px`;
      blockly.style.height = `${container.offsetHeight}px`;
      Blockly.svgResize(this.workspace);
    }, 0);
  }

  addBlocklyBlocks() {
    Blockly.Blocks.text_alert = {
      init() {
        this.jsonInit(printBlock);
      },
    };
    Blockly.JavaScript.text_alert = function(block) {
      const valueText = Blockly.JavaScript.valueToCode(
        block,
        'TEXT',
        Blockly.JavaScript.ORDER_ATOMIC,
      );
      return `print(${valueText});\n`;
    };
  }

  workspaceUpdater() {
    this.code = Blockly.JavaScript.workspaceToCode(this.workspace);
    this.codeRef.current.innerHTML = this.code;
    const xml = Blockly.Xml.workspaceToDom(this.workspace);
    this.props.callbackSave(Blockly.Xml.domToText(xml));
  }

  handleRunCode = () => {
    /*
    const codeInterpreter = new jsInterpreter.Interpreter(
      this.code,
      this.initApi,
    );
    try {
      codeInterpreter.run();
    } catch (error) {
      alert(error);
    }
    */
    this.setState({ running: true });
  };

  handleStopCode = () => {
    this.setState({ running: false });
  };

  handleToggleCodeCollapsed = () => {
    this.setState(oldState => ({ codeCollapsed: !oldState.codeCollapsed }));
    this.refreshSize();
  };

  initApi = (interpreter, scope) => {
    let wrapper = text => alert(text);
    interpreter.setProperty(
      scope,
      'alert',
      interpreter.createNativeFunction(wrapper),
    );
    wrapper = text => this.props.callbackCode(text);
    interpreter.setProperty(
      scope,
      'print',
      interpreter.createNativeFunction(wrapper),
    );
  };

  render() {
    return (
      <div className={s.tabRoot}>
        <div ref={this.containerRef} className={s.blocklyContainer}>
          <div ref={this.blocklyRef} className={s.blockly} />
          <xml ref={this.toolboxRef}>
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
              <block type="text_alert" />
              <block type="text" />
            </category>
          </xml>
        </div>
        <div className={s.sidebar}>
          {this.state.running ? (
            <ColoredIconButton
              onClick={this.handleStopCode}
              disableRipple
              color="red"
            >
              <StopIcon />
            </ColoredIconButton>
          ) : (
            <ColoredIconButton
              onClick={this.handleRunCode}
              disableRipple
              color="limegreen"
            >
              <PlayArrowIcon />
            </ColoredIconButton>
          )}
          <br />
          <ColoredIconButton onClick={this.handleToggleCodeCollapsed}>
            {this.state.codeCollapsed ? (
              <KeyboardArrowLeftIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
          </ColoredIconButton>
        </div>
        <pre
          ref={this.codeRef}
          className={
            this.state.codeCollapsed
              ? `${s.codeContainer} ${s.collapsed}`
              : s.codeContainer
          }
        />
      </div>
    );
  }
}

export default withStyles(s)(VisualEditor);
