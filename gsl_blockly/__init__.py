from gsl.yaml import YAML


def get_model(model_file, msg_model_file):
    with open(model_file) as f, open(msg_model_file) as msg_f:
        yaml = YAML(typ='safe')
        model = yaml.load(f)
        msg_model = yaml.load(msg_f)

    def augment_module(name, mod):
        def augment_block(name, block):
            block.name = name
            block.langs = {}
            return block

        blocks = [augment_block(*pair) for pair in mod.items()]
        mod.clear()
        mod.name = name
        mod.blocks = blocks
        if name in msg_model.modules:
            for lang, lang_blocks in msg_model.modules[name].items():
                for block in mod.blocks:
                    if block.name in lang_blocks:
                        block.langs[lang] = lang_blocks[block.name]

        return mod

    model.modules = [augment_module(*pair) for pair in model.modules.items()]

    return model


def main():
    from . import blockly_target

    model = get_model('gsl_blockly/blockly.yaml', 'gsl_blockly/blockly_msgs.yaml')
    root = '.'
    blockly_target.generate_code(model, root)
