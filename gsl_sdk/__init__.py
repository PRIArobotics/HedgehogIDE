from gsl.yaml import YAML


def get_model(model_file):
    with open(model_file) as f:
        yaml = YAML(typ='safe')
        model = yaml.load(f)

    def augment_module(name, mod):
        def augment_function(name, function):
          function.name = name
          if not 'hasReply' in function:
            function.hasReply = False
          if not 'handlerName' in function:
            function.handlerName = function.name
          return function

        if not 'includeLookup' in mod:
          mod.includeLookup = False
        functions = [augment_function(*pair) for pair in mod.functions.items()]
        mod.functions = functions
        mod.name = name
        return mod

    model.modules = [augment_module(*pair) for pair in model.modules.items()]

    return model

def main():
  from . import sdk_target

  model = get_model('./gsl_sdk/sdk.yaml')
  root = '.'
  sdk_target.generate_code(model, root)
