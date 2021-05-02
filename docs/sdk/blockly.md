# Blockly SDK
The Blockly SDK allows plugins to register custom blocks with Hedgehog IDE's visual programming which is based on [Blockly](https://developers.google.com/blockly/).
The visual programs in turn can invoke functionality of the plugin via these blocks.

## Functions
#### `async sdk.blockly.addBlock(dynamicBlock: DynamicBlock)`
Adds a custom block to the visual programming environment.
The block will also be added to the toolbar in the *custom* section.

**IMPORTANT:** This is an initialization-phase function and MUST be called before `sdk.misc.pluginReady()`.

- `dynamicBlock`: Object describing the block.
  The block description consists of Blockly's `blockJson` definition (https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks) and the default input values for the block in the toolbox.
  The latter is usually supplied as XML, but for security reasons, this function will just take the input values and generate the toolbox item.
  We are aware however that this might limit the complexity of block which can be created with this function.

  ```ts
  type DynamicBlock = {
    blockJson: Object,
    toolboxBlocksData: {
      [inputName: string]: {
        valueType: string,
        fields: {
          name: string,
          value: any,
        }[],
      },
    },
  };
  ```

The block for the code will be automatically generated to make a call to the command `blk_<BLOCK-NAME>_called` and the block input values will be passed as the call payload.

**Example:** The following plugin adds a custom block named `custom_print_block` with input `TEXT` and registers the call handler for invocations of that block.

When the block is invoked, the plugin will print the block's input values.

```ts
sdk.blockly.addBlock({
  blockJson: {
    type: 'custom_print_block',
    message0: 'custom print %1',
    args0: [
      {
        type: 'input_value',
        name: 'TEXT',
        check: [
          'Number',
          'Boolean',
          'String'
        ]
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: 'prints a text, but custom',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  toolboxBlocksData: {
    'TEXT': {
      valueType: 'text',
      fields: [],
    },
  },
});

sdk.misc.registerCall('blk_custom_print_block', (payload) => {
  sdk.misc.print(payload.TEXT);
});

sdk.misc.pluginReady();
```

**Example:** The following plugin adds a custom block named `custom_expression_block` with input `VALUE` and registers the call handler for invocations of that block.
Note that here, `registerCallWithReply` is used, which takes the return value of the handler function to pass back to the user's code.

When the block is invoked, the plugin will return the passed value back to the user's code.

```ts
sdk.blockly.addBlock({
  blockJson: {
    type: 'custom_expression_block',
    message0: 'return  %1',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
      },
    ],
    inputsInline: true,
    output: null,
    colour: 120,
    tooltip: 'passes through the expression unchanged, but custom',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  toolboxBlocksData: {
  },
});

sdk.misc.registerCallWithReply('blk_custom_expression_block', (payload) => {
  return payload.VALUE;
});
```

## Events
This module does not have any events.
