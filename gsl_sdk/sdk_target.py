import os.path

from gsl import lines, generate


def generate_code(model, root='.'):
  for cls in model.classes:
    generate_executor_class_code(model, cls, root)
    generate_ide_code(model, cls, root)


def generate_ide_code(model, cls, root):
  out_file = os.path.join(root, 'src/sdk', f'{cls.name}.js')
  os.makedirs(os.path.dirname(out_file), exist_ok=True)

  def handler_static_method_code(method):
    yield from lines(f"""\
      '{cls.name}_{method.name}': () => {{}}
""")

  def handler_code():
    yield from lines(f"""\
export default function {cls.name}Handler() {{
  return {{
""")
    for method in cls.methods:
      if method.static:
        yield from handler_static_method_code(method)
    yield from lines(f"""\
  }};
}}
""")

  def method_code(method):
    yield from lines(f"""\
  {'static ' if method.static == True else ''}async {method.name}({', '.join([arg.name for arg in method.args])}) {{
    // method code goes here
  }}
\n""")

  def class_code():
    yield from lines(f"""\
export class {cls.name} {{
  constructor({', '.join([arg.name for arg in cls.constructor.args])}) {{
    // code goes here
  }}
\n""")
    for method in cls.methods:
      yield from method_code(method)
    yield from lines(f"""\
}}
""")

  @generate(out_file)
  def code():
    yield from lines(f"""\
// @flow
/* eslint-disable */
\n""")
    yield from class_code()
    yield from handler_code()

def generate_executor_class_code(model, cls, root):
  out_file = os.path.join(root, 'src/executor/sdk', f'{cls.name}.js')
  os.makedirs(os.path.dirname(out_file), exist_ok=True)

  def method_code(method):
    yield from lines(f"""\
  {'static ' if method.static == True else ''}async {method.name}({', '.join([arg.name for arg in method.args])}) {{
    // method code goes here
  }}
\n""")

  @generate(out_file)
  def code():
    yield from lines(f"""\
// @flow
/* eslint-disable */

export default class {cls.name} {{
  constructor({', '.join([arg.name for arg in cls.constructor.args])}) {{
    // code goes here
  }}
\n""")
    for method in cls.methods:
      yield from method_code(method)
    yield from lines(f"""\
}}
""")

