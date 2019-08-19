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
        <xml id="toolbox" style={{ display: 'none' }} ref={(toolbox) => this.toolbox = toolbox} >
          <block type="controls_if" />
          <block type="controls_repeat_ext" />
          <block type="logic_compare" />
          <block type="math_number" />
          <block type="math_arithmetic" />
          <block type="text" />
          <block type="text_print" />
        </xml>
      </React.Fragment>
    );
  }
}
export default VisualEditor;
