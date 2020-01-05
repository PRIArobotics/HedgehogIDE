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

        def augment_lang(key, lang):
            def augment_block(name, block):
                block.name = name
                return block

            blocks = [augment_block(*pair) for pair in lang.items()]
            lang.clear()
            lang.key = key
            lang.blocks = blocks

            return lang

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
    # from ruamel.yaml import YAML
    # from collections import OrderedDict

    # yaml = YAML(typ='rt')
    # yaml.default_flow_style = False
    # with open('gsl_blockly/blockly_msgs.yaml') as f:
    #     model = yaml.load(f)

    # for module in model['modules'].values():
    #     new_blocks = OrderedDict()
    #     for lang, blocks in module.items():
    #         print(lang)
    #         for block, content in blocks.items():
    #             if block not in new_blocks:
    #                 new_blocks[block] = OrderedDict()
    #             new_blocks[block][lang] = content
    #     module.clear()
    #     module.update(new_blocks)

    # with open('gsl_blockly/blockly_msgs.yaml', mode='w') as f:
    #     yaml.dump(model, f)

    from . import blockly_target

    model = get_model('gsl_blockly/blockly.yaml', 'gsl_blockly/blockly_msgs.yaml')
    root = '.'
    blockly_target.generate_code(model, root)
