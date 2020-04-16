# Blockly SDK
The Blockly SDK allows interactions with Hedgehog IDE's visual programming which is based on [Blockly](https://developers.google.com/blockly/).

## Functions
#### `sdk.blockly.addBlock(dynamicBlock: DynamicBlock)`
Adds a custom block to the visual programming environment. The block will also be added to the toolbar in the *custom* section.

*IMPORTANT*: This is an initialization-phase function and MUST be called before `sdk.misc.pluginReady()`.

Arguments:
- dynamicBlock: Object describing the block. The block description consists of Blockly's `blockJson` definition (https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks) and the default input values for the block in the toolbox. The latter is usually supplied as XML, but for security reasons, this function will just take the input values and generate the toolbox item. We are aware however that this might limit the complexity of block which can be created with this function.
```javascript
type DynamicBlock = {
  blockJson: Object,
  toolboxBlocksData: {
    [inputName: string]: {
      valueType: string,
      fields: [
        {
          name: string,
          value: any,
        },
      ],
    },
  },
};
```

The block for the code will be automatically generated to fire an event named `blk_<BLOCK-NAME>_called` and the block input values will be passed as event payload.

Example:
The following example plugin adds a custom block named `custom_block` with two inputs `PORT` and `SPEED` and registers the event listener for invocations of that block. When the block is invoked, the plugin will print the block's input values.
```javascript
sdk.blockly.addBlock({
  blockJson: {
    type: 'custom_block',
    message0: 'custom block  %1 %2',
    args0: [
      {
        "type": "field_number",
        "name": "PORT",
        "value": 0,
        "min": 0,
        "max": 15,
        "precision": 1
      },
      {
        "type": "input_value",
        "name": "SPEED",
        "check": "Number"
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: 'custom block tooltip',
    helpUrl: 'TODO',
    extensions: ['requires_async_js_function'],
  },
  toolboxBlocksData: {
    'SPEED': {
      valueType: 'math_number',
      fields: [{
        name: 'NUM',
        value: 20
      }]
    }
  }
});

sdk.blockly.on('blk_custom_block_called', (payload) => {
  console.log('custom_test block called!');
  console.log(payload);
});

sdk.misc.pluginReady();
```

## Events
#### `blk_<BLOCK-NAME>_called`
Event which fires when a custom block has been invoked. The block input values will be passed as payload.

