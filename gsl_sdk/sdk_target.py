import os.path

from gsl import lines, generate


def generate_code(model, root='.'):
  for cls in model.classes:
    generate_executor_code(model, cls, root)


def generate_executor_code(model, cls, root):
  out_file = os.path.join(root, 'src/sdk', f'{cls.name}.js')
  os.makedirs(os.path.dirname(out_file), exist_ok=True)

  def method_code(method):
    yield from lines(f"""\
  {method.name}({', '.join([arg.name for arg in method.args])}) {{
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

