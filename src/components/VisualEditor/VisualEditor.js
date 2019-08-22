// @flow

import React from 'react';
import Blockly from 'blockly';

type BlocklyState = any;

type PropTypes = {|
  callbackSave: (state: BlocklyState) => void,
  callbackGet: () => BlocklyState,
|};
type StateTypes = {||};

class VisualEditor extends React.Component<PropTypes, StateTypes> {
  containerRef: React.RefObject = React.createRef();

  toolboxRef: React.RefObject = React.createRef();

  codeRef: React.RefObject = React.createRef();

  workspace: Blockly.Workspace;

  componentDidMount() {
    this.workspace = Blockly.inject(this.containerRef.current, {
      toolbox: this.toolboxRef.current,
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
    });
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
  }

  workspaceUpdater() {
    this.code = Blockly.JavaScript.workspaceToCode(this.workspace);
    this.codeRef.current.innerHTML = this.code;
    const xml = Blockly.Xml.workspaceToDom(this.workspace);
    this.props.callbackSave(Blockly.Xml.domToText(xml));
  }

  render() {
    return (
      <React.Fragment>
        <div
          ref={this.containerRef}
          style={{
            height: '450px',
            width: '700px',
            float: 'left',
            borderRight: '2px solid black',
          }}
        />
        <pre ref={this.codeRef} />
        <xml ref={this.toolboxRef} style={{ display: 'none' }}>
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
