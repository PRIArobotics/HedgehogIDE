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
    yield from lines(f"""\
     '{command_for(module, function.name)}': () => {{}},
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
    // function code goes here
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

export default function init() {{
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

