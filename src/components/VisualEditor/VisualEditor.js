// @flow

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Blockly from 'blockly';
import jsInterpreter from './interpreter';
import acorn from './acorn';

global.acorn = acorn;

const printBlock = {
  type: 'text_alert',
  message0: 'Output %1',
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

import s from './VisualEditor.scss';

type BlocklyState = any;

type PropTypes = {|
  layoutNode: any,
  callbackSave: (state: BlocklyState) => void,
  callbackGet: () => BlocklyState,
|};
type StateTypes = {||};

class VisualEditor extends React.Component<PropTypes, StateTypes> {
  containerRef: React.RefObject = React.createRef();

  blocklyRef: React.RefObject = React.createRef();

  toolboxRef: React.RefObject = React.createRef();

  codeRef: React.RefObject = React.createRef();

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
    try {
      const workspaceXml = this.props.callbackGet();
      Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(workspaceXml),
        this.workspace,
      );
    } catch (error) {
      // console.log(error);
    }
    this.workspace.addChangeListener(() => this.workspaceUpdater());

    this.props.layoutNode.setEventListener('resize', () => {
      setTimeout(() => {
        const container = this.containerRef.current;
        const blockly = this.blocklyRef.current;
        blockly.style.width = `${container.offsetWidth}px`;
        blockly.style.height = `${container.offsetHeight}px`;
        Blockly.svgResize(this.workspace);
      }, 0);
    });
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
      return `alert(${valueText});\n`;
    };
  }

  workspaceUpdater() {
    this.code = Blockly.JavaScript.workspaceToCode(this.workspace);
    this.codeRef.current.innerHTML = this.code;
    const xml = Blockly.Xml.workspaceToDom(this.workspace);
    this.props.callbackSave(Blockly.Xml.domToText(xml));
  }

  runCode = () => {
    try {
      const codeInterpreter = new jsInterpreter.Interpreter(
        this.code,
        this.initApi,
      );
      codeInterpreter.run();
    } catch (error) {
      alert(error);
    }
  };

  initApi = (interpreter, scope) => {
    const wrapper = text => alert(text);
    interpreter.setProperty(
      scope,
      'alert',
      interpreter.createNativeFunction(wrapper),
    );
  };

  render() {
    return (
      <div className={s.tabRoot}>
        <div ref={this.containerRef} className={s.blocklyContainer}>
          <div ref={this.blocklyRef} className={s.blockly} />
          <xml ref={this.toolboxRef}>
            <category name="Logic" colour="210">
              <block type="controls_if" />
              <block type="logic_compare" />
              <block type="logic_operation" />
              <block type="logic_boolean" />
            </category>
            <category name="Loops" colour="120">
              <block type="controls_whileUntil" />
              <block type="controls_for" />
            </category>
            <category name="Math" colour="230">
              <block type="math_number" />
              <block type="math_arithmetic" />
            </category>
            <category name="Variables" custom="VARIABLE" colour="330" />
            <category name="Functions" custom="PROCEDURE" colour="290" />
          </xml>
        </div>
        <pre ref={this.codeRef} className={s.codeContainer} />
      </div>
    );
  }
}

export default withStyles(s)(VisualEditor);
