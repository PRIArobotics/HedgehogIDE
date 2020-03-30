from gsl.yaml import YAML


def get_model(model_file):
    with open(model_file) as f:
        yaml = YAML(typ='safe')
        model = yaml.load(f)

    def augment_class(name, cls):
        def augment_method(name, method):
          method.name = name
          return method

        methods = [augment_method(*pair) for pair in cls.methods.items()]
        cls.methods = methods
        cls.name = name
        return cls

    model.classes = [augment_class(*pair) for pair in model.classes.items()]

    return model

def main():
  from . import sdk_target

  model = get_model('./gsl_sdk/sdk.yaml')
  root = '.'
  sdk_target.generate_code(model, root)
