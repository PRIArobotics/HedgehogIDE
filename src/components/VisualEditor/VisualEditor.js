import React from 'react';
import BlocklyComponent, { Block, Value, Field, Shadow } from './Blockly';

class VisualEditor extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <BlocklyComponent
            ref={e => (this.simpleWorkspace = e)}
            readOnly={false}
            move={{
              scrollbars: true,
              drag: true,
              wheel: true,
            }}
            initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml">
<block type="controls_if" x="0" y="0"></block>
</xml>
      `}
          >
            <Block type="controls_ifelse" />
            <Block type="logic_compare" />
            <Block type="logic_operation" />
            <Block type="controls_repeat_ext">
              <Value name="TIMES">
                <Shadow type="math_number">
                  <Field name="NUM">10</Field>
                </Shadow>
              </Value>
            </Block>
            <Block type="logic_operation" />
            <Block type="logic_negate" />
            <Block type="logic_boolean" />
            <Block type="logic_null" disabled="true" />
            <Block type="logic_ternary" />
            <Block type="text_charAt">
              <Value name="VALUE">
                <Block type="variables_get">
                  <Field name="VAR">text</Field>
                </Block>
              </Value>
            </Block>
          </BlocklyComponent>
        </header>
      </div>
    );
  }
}
export default VisualEditor;
