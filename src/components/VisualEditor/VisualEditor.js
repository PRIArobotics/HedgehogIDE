import React from 'react';
import Blockly from 'blockly';

/*
  TODO Blockly is bugged when there are multiple instances open on the same page.
   Saving and Loading the state from LocalStorage doesn't work with multiple instances of Blockly.
   Having other Tabs that aren't Blockly open does not create bugs.
 */
class VisualEditor extends React.Component {
  componentDidMount() {
    this.workspace = Blockly.inject(`blocklyDiv-${this.props.id}`, {
      toolbox: this.toolbox,
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
    });
    try {
      const workspaceText = this.props.callbackGet(this.props.id);
      console.log(workspaceText.workspaceXml);
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(workspaceText.workspaceXml), this.workspace);
    } catch (error) {
      console.log(error);
    }
    this.workspace.addChangeListener(() => this.workspaceUpdated());
  }

  workspaceUpdated() {
    this.code = Blockly.JavaScript.workspaceToCode(this.workspace);
    document.getElementById(`workspaceCode-${this.props.id}`).innerHTML = this.code;
    const xml = Blockly.Xml.workspaceToDom(this.workspace);
    this.props.callbackSave(Blockly.Xml.domToText(xml), this.props.id);
  }

  render() {
    return (
      <React.Fragment>
        <div id={`blocklyDiv-${this.props.id}`} style={{ height: '600px', width: '700px', float: 'left', borderRight: '2px solid black'}} />
        <xml id={`toolbox-${this.props.id}`} style={{ display: 'none' }} ref={(toolbox) => {this.toolbox = toolbox}}>
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
        <pre id={`workspaceCode-${this.props.id}`} />
      </React.Fragment>
    );
  }
}
export default VisualEditor;
