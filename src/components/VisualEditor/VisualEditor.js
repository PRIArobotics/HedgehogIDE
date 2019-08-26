// @flow

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Blockly from 'blockly';
import jsInterpreter from './interpreter';
import acorn from './acorn';

import s from './VisualEditor.scss';

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

class VisualEditor extends React.Component<PropTypes, StateTypes> {
  containerRef: React.RefObject = React.createRef();

  blocklyRef: React.RefObject = React.createRef();

  toolboxRef: React.RefObject = React.createRef();

  codeRef: React.RefObject = React.createRef();

  mountPoint: React.RefObject = React.createRef();

  workspace: Blockly.Workspace;

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

    this.props.layoutNode.setEventListener('resize', this.refreshSize);
    this.props.layoutNode.setEventListener('visibility', this.unselectBlock);
    this.refreshSize();
  }

  refreshSize = () => {
    setTimeout(() => {
      const container = this.containerRef.current;
      const blockly = this.blocklyRef.current;
      blockly.style.width = `${container.offsetWidth}px`;
      blockly.style.height = `${container.offsetHeight}px`;
      Blockly.svgResize(this.workspace);
    }, 0);
  };

  unselectBlock = () => {
    Blockly.hideChaff();
  };

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

  runCode = () => {
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
    const frame = document.createElement('iframe');
    frame.setAttribute('src', 'www.google.com');
    frame.setAttribute('sandbox', 'allow-scripts');
    this.mountPoint.current.appendChild(frame);
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
        <div style={{ overflow: 'auto' }}>
          <pre ref={this.codeRef} className={s.codeContainer} />
          <button onClick={this.runCode}>Run</button>
        </div>
        <div ref={this.mountPoint} style={{ display: 'block' }} />
      </div>
    );
  }
}

export default withStyles(s)(VisualEditor);
