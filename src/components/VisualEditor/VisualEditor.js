import React from 'react';
import Blockly from 'blockly';

class VisualEditor extends React.Component {
  componentDidMount() {
    Blockly.inject('blocklyDiv', { toolbox: this.toolbox });
  }

  render() {
    return (
      <React.Fragment>
        <div id="blocklyDiv" style={{ height: '600px', width: '1000px' }} />
        <xml id="toolbox" style={{ display: 'none' }} ref={(toolbox) => {this.toolbox = toolbox}}>
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
      </React.Fragment>
    );
  }
}
export default VisualEditor;
