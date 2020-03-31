import os.path

from gsl import lines, generate


def command_for(module, name, is_event=False):
  return f'{module.name}{"_evt_" if is_event else "_"}{name}'

def generate_code(model, root='.'):
  for module in model.modules:
    generate_executor_module_code(model, module, root)
    generate_ide_code(model, module, root)


def generate_ide_code(model, module, root):
  out_file = os.path.join(root, 'src/sdk', f'{module.name}.js')
  os.makedirs(os.path.dirname(out_file), exist_ok=True)

  def handler_function_code(function):
    if function.hasReply:
      yield from lines(f"""\
    '{command_for(module, function.name)}': withReply({function.name}),
""")
    else:
      yield from lines(f"""\
    '{command_for(module, function.name)}': (payload) => {function.name}(...payload),
""")

  def handler_code():
    yield from lines(f"""\
  return {{
""")
    for function in module.functions:
      yield from handler_function_code(function)
    yield from lines(f"""\
  }};\
""")

  def function_code(function):
    yield from lines(f"""\
  async function {function.name}({', '.join([arg.name for arg in function.args])}) {{
    // <default GSL customizable: {module.name}-body-{function.name}>
    // Your function code goes here
    // DO NOT DELETE GSL TAGS

    // </GSL customizable: {module.name}-body-{function.name}>
  }}
\n""")

  def impl_code():
    for function in module.functions:
      yield from function_code(function)

  @generate(out_file)
  def code():
    yield from lines(f"""\
// @flow
/* eslint-disable */

import {{ withReply }} from './SDKBase';

export default async function init({', '.join([arg.name for arg in module.init.args])}) {{
  // <default GSL customizable: {module.name}-init>
  // Your module initialization code
  // DO NOT DELETE GSL TAGS

  // </GSL customizable: {module.name}-init>
\n""")
    yield from impl_code()
    yield from handler_code()
    yield from lines(f"""\
}};
""")

def generate_executor_module_code(model, module, root):
  out_file = os.path.join(root, 'src/executor/sdk', f'{module.name}.js')
  os.makedirs(os.path.dirname(out_file), exist_ok=True)

  def function_code(function):
    yield from lines(f"""\
export {'async ' if function.hasReply else ''}function {function.name}({', '.join([arg.name for arg in function.args])}) {{
  connection.send('{command_for(module, function.name)}', {{ {', '.join([arg.name for arg in function.args])} }});
""")
    if function.hasReply:
      yield from lines(f"""\
  return connection.recv();
""")
    yield from lines(f"""\
}}
\n""")

  @generate(out_file)
  def code():
    yield from lines(f"""\
// @flow
/* eslint-disable */
\n""")
    for function in module.functions:
      yield from function_code(function)

