import os.path
import json
import textwrap

from gsl import lines, generate


def js_string(s):
    return json.dumps(s, ensure_ascii=False)


def generate_code(model, root='.'):
    for mod in model.modules:
        generate_module_code(model, mod, root)
        if 'langs' in mod:
            for lang in mod.langs:
                generate_msg_module_code(model, mod, lang, root)


def generate_module_code(model, mod, root):
    out_file = os.path.join(root, 'src/components/ide/VisualEditor/blocks', f'{mod.name}.js')
    os.makedirs(os.path.dirname(out_file), exist_ok=True)

    @generate(out_file)
    def code():
        def block_code(block):
            yield from lines(f"""\

export const {block.name.upper()}: Block = {{
  blockJson: {{
    type: '{block.name}',
    message0: '%{{BKY_{block.name.upper()}}}',""")
            if 'args' in block:
                yield from lines(textwrap.indent(f"""\
args0: {json.dumps(block.args, indent=2)},""", 4 * " "))

            if 'output' in block:
                yield from lines(f"""\
    output: '{block.output}',""")
            else:
                if not block.get('scope', False):
                    yield from lines(f"""\
    inputsInline: true,""")
                yield from lines(f"""\
    previousStatement: null,
    nextStatement: null,""")
            yield from lines(f"""\
    colour: 120,
    tooltip: '%{{BKY_{block.name.upper()}_TOOLTIP}}',
    helpUrl: 'TODO',""")
            extensions = []
            if block.get('async', False):
                extensions.append('requires_async_js_function')
            if extensions:
                yield from lines(f"""\
    extensions: [{', '.join(f"'{extension}'" for extension in extensions)}],""")
            yield from lines(f"""\
  }},
  generators: {{""")
            for language in ['JavaScript']:
                yield from lines(f"""\
    {language}: block => {{""")
                if 'args' in block:
                    for arg in block.args:
                        if arg.type == 'input_dummy':
                            continue
                        elif arg.type == 'input_statement':
                            yield from lines(f"""\
      const statements = Blockly.{language}.statementToCode(block, {repr(arg.name)});""")
                        elif arg.type == 'field_checkbox':
                            yield from lines(f"""\
      const {arg.name.lower()} = block.getFieldValue({repr(arg.name)}) === 'TRUE';""")
                        elif arg.type.startswith('field_'):
                            yield from lines(f"""\
      const {arg.name.lower()} = block.getFieldValue({repr(arg.name)});""")

                yield from lines(f"""\
      // <default GSL customizable: {block.name}-body-{language}>""")
                if 'args' in block:
                    for arg in block.args:
                        if arg.type not in {'input_dummy', 'input_statement'} and arg.type.startswith('input_'):
                            yield from lines(f"""\
      const {arg.name.lower()} = Blockly.{language}.valueToCode(block, {repr(arg.name)}, Blockly.{language}.ORDER_ATOMIC);""")
                yield from lines(f"""\
      // TODO generate code
      const code = '';""")
                if 'output' not in block:
                    yield from lines(f"""\
      return code;""")
                else:
                    yield from lines(f"""\
      return [code, Blockly.{language}.ORDER_NONE];""")
                yield from lines(f"""\
      // </GSL customizable: {block.name}-body-{language}>
    }},""")
            yield from lines(f"""\
  }},
  toolboxBlocks: {{
    default: () => (
      <block type="{block.name}">
        {{/* <default GSL customizable: {block.name}-default-toolbox> */}}""")
            if 'args' in block:
                for arg in block.args:
                    if arg.type == 'input_value':
                        if arg.check == 'Number':
                            yield from lines(f"""\
        <value name="{arg.name}">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>""")
            yield from lines(f"""\
        {{/* </GSL customizable: {block.name}-default-toolbox> */}}
      </block>
    ),
    // <default GSL customizable: {block.name}-extra-toolbox />
  }},
}};""")

        # TODO onchange for requiresScope

        yield from lines(f"""\
// @flow
/* eslint-disable */

import * as React from 'react';
import Blockly from 'blockly';

import {{ type Block }} from '.';""")
        for block in mod.blocks:
            yield from block_code(block)


def generate_msg_module_code(model, mod, lang, root):
    out_file = os.path.join(root, 'src/components/ide/VisualEditor/blocks', f'{mod.name}_msg_{lang.key}.js')
    os.makedirs(os.path.dirname(out_file), exist_ok=True)

    @generate(out_file)
    def code():
        yield from lines(f"""\
// @flow
/* eslint-disable */

import Blockly from 'blockly';
""")

        def assigment_code(block, suffix, msg_key):
            if msg_key in block:
                key = block.name.upper()
                if suffix is not None:
                    key += f"_{suffix}"

                yield from lines(f"""\
Blockly.Msg['{key}'] = {repr(block[msg_key])};""")

        for block in lang.blocks:
            yield from lines(f"""\

""")
            yield from assigment_code(block, None, 'msg')
            yield from assigment_code(block, 'TOOLTIP', 'tooltip')
