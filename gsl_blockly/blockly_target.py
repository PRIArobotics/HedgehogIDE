import os.path
import json
import textwrap

from gsl import lines, generate


def js_string(s):
    return json.dumps(s, ensure_ascii=False)


def generate_code(model, root='.'):
    for mod in model.modules:
        for block in mod.blocks:
            generate_block_code(model, mod, block, root)
        # generate_generator_module_code(model, mod, root)
        # if 'langs' in mod:
        #     for lang in mod.langs:
        #         generate_msg_module_code(model, mod, lang, root)


def generate_block_code(model, mod, block, root):
    out_file = os.path.join(root, 'src/components/ide/VisualEditor/blocks', mod.name, f'{block.name}.js')
    os.makedirs(os.path.dirname(out_file), exist_ok=True)

    @generate(out_file)
    def code():
        lang = block.langs.get('en', {})

        yield from lines(f"""\
// @flow
/* eslint-disable */

import * as React from 'react';
import Blockly from 'blockly';

import {{ type Block }} from '..';

const {block.name.upper()}: Block = {{
  blockJson: {{
    type: '{block.name}',
    message0: '{lang.get('msg', 'TODO')}',""")
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
    tooltip: '{lang.get('tooltip', 'TODO')}',
    helpUrl: 'TODO',
  }},
  generators: {{
    JavaScript: block => {{""")
        if 'args' in block:
            for arg in block.args:
                if arg.type == 'input_dummy':
                    continue
                elif arg.type == 'input_statement':
                    yield from lines(f"""\
      const statements = Blockly.Python.statementToCode(block, {repr(arg.name)});""")
                elif arg.type == 'field_checkbox':
                    yield from lines(f"""\
      const {arg.name.lower()} = block.getFieldValue({repr(arg.name)}) === 'TRUE';""")
                elif arg.type.startswith('field_'):
                    yield from lines(f"""\
      const {arg.name.lower()} = block.getFieldValue({repr(arg.name)});""")

        yield from lines(f"""\
      // <default GSL customizable: {block.name}-body>""")
        if 'args' in block:
            for arg in block.args:
                if arg.type not in {'input_dummy', 'input_statement'} and arg.type.startswith('input_'):
                    yield from lines(f"""\
      const {arg.name.lower()} = Blockly.Python.valueToCode(block, {repr(arg.name)}, Blockly.Python.ORDER_ATOMIC);""")
        yield from lines(f"""\
      // TODO generate code
      const code = '';""")
        if 'output' not in block:
            yield from lines(f"""\
      return code;""")
        else:
            yield from lines(f"""\
      return [code, Blockly.JavaScript.ORDER_NONE];""")
        yield from lines(f"""\
      // </GSL customizable: {block.name}-body>
    }},
  }},
toolboxBlocks: {{
    default: () => (
      <block type="{block.name}">{{
        // <default GSL customizable: {block.name}-default-toolbox />
      }}</block>
    ),
    // <default GSL customizable: {block.name}-extra-toolbox />
  }},
}};

export default {block.name.upper()};""")

        # TODO onchange for requiresScope
