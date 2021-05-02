# Plugins
Plugins allow developers to extend the functionality of Hedgehog IDE.

## Writing plugins
Plugins are attached to projects and are located in a folder called `.metadata/plugins`. Each JavaScript file within the plugin directory is a plugin. Hedgehog IDE will automatically load the plugin when loading the project.

Some important things to note:
- Although plugins open in the normal JS editor, which shows the "Execute" button in the sidebar to the right, pressing that button makes no sense; this would execute the plugin code as a regular program, and probably lead to lots of errors.
- Plugins are only loaded once when opening a project. To test your plugin code, reload the page, or go back to the project overview and reopen the project.
- Each plugin must call `sdk.misc.pluginReady()` once it has finished initializing - if it does not (including because of an exception), the project will not successfully load and the workspace to the right of the file tree will remain empty! It is therefore recommended to use `try`/`finally` for calling `pluginReady`:

  ```js
  try {
    // ... plugin initialization ...
  } finally {
    sdk.misc.pluginReady();
  }
  ```

  As long as `pluginReady` was called, the IDE's console will show any error encountered during the plugin's initialization. Whether or not `pluginReady` was called, the error will also be shown in the JS console.
- Even with `try`/`finally`, a syntax error could prevent `pluginReady` from being called. If for any reason the workspace does not load while developing a plugin,
  - open the JS console in your browser
    ([Firefox](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools#the_javascript_console),
    [Chrome](https://developer.chrome.com/docs/devtools/open/#console),
    [Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/open/?tabs=cmd-Windows#open-the-console-panel))
    and check for any error that may be the cause
  - rename or move the offending plugin in the file tree, so that it is no recognized as a plugin
  - reload the page or reopen the project to load the workspace
  - edit the plugin to fix the error
  - rename the plugin back
  - reload or reopen again to check the results

## SDKs
For security reasons, plugins run (as normal user programs also do) in an sandboxed environment. The only way for plugins to interact with Hedgehog IDE and its components is via so-called SDKs. Data passed between the IDE and the sandboxed plugin is serialized by the browser using the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), so, for example, instances of classes will preserve their properties, but not their prototypes.

Every SDK enables interaction with a specific aspect of the IDE. The following SDK modules are currently available:

- `misc`: general IDE functionality
- `hedgehog`: control simulated robots; this is intended for user programs, but is also available for plugins
- `blockly`: add blocks to the blockly toolbox that can be used by user programs
- `simulation`: access and manipulate simulated objects, listen to collision events

The SDK modules are exposed as properties of the global variable `sdk`. For instance, to access the function `addBlock` of the `blockly` module, write `sdk.blockly.addBlock`.

SDKs provide two kinds of primitives: functions and events.

### Functions

Functions enable plugins to initiate an operation within the IDE. Functions can be further divided into those with responses and those without.

A response can be either just a notification that the command has finished, as with `blockly.addBlock`, or a result, as with `simulation.get`:

```js
// tell the IDE to add ablock to the Blockly toolbox
await sdk.blockly.addBlock(myBlock);
// the command has been completed

// tell the IDE to get the 'ball' object from the simulation
const { ball } = await sdk.simulation.get(['ball']);
// the command has been completed, the variable contains the ball's properties
```

Note how `await` is used to call these functions. This kind of behavior is used by functions that
- return a result,
- can fail and may need to throw an exception, or
- need to finish before the plugin can continue its execution.

Functions without responses are *fire-and-forget*: the plugin gives a command to the IDE, but is not notified when that command completed. An example is `simulation.remove`:

```js
// tell the IDE to remove the 'ball' object from the simulation
sdk.simulation.remove(['ball']);
// the command was sent, but has not yet been completed by the IDE
```

Note there's no `await`. This behavior is used by functions that have none of the above requirements.

### Events

Events allow plugins to run code as a reaction to things happening in the IDE. An example would be when a user starts their program, or when two simulated objects collide. To react to events, the plugin has to register an event handler for that event via the corresponding SDK's `on` function, e.g. like this:

```js
sdk.misc.on('programExecute', () => {
  print('program started!');
});
```

In this example, the event handler is from the `programExecute` event of the `misc` SDK.

### Core plugin functions
#### `sdk.<MODULE>.on(event: string, cb: (payload: any) => void)`
Register an event handler.

Arguments:
- `event`: Event name
- `cb`: Handler function which will be called when the event occurs

#### `sdk.<MODULE>.registerCall(command: string, cb: (payload: any) => void)`
Register a command handler.

Arguments:
- `name`: Function name
- `cb`: Handler function which will be called when the command is invoked

#### `sdk.<MODULE>.registerCallWithReply(command: string, cb: (payload: any) => any)`
Register a command handler that returns a result.

Arguments:
- `name`: Function name
- `cb`: Handler function which will be called when the command is invoked

#### `sdk.misc.exit()`
Terminates the plugin.

#### `sdk.misc.pluginReady()`
Some features and functions of the SDK require to be executed before the IDE and all the view components are fully initialized. Therefore, plugins need to signal that all initialization code is complete and the IDE can complete the initialization phase and display the views to the user.

*IMPORTANT*: Every plugin MUST call this function after performing any of there early stage SDK calls, even those which do not perform any initialization-phase SDK calls at all.

### Core Plugin Events
Core events are fired within the `misc` namespace (use `sdk.misc.on(EVENT, ...)` to register to them).

#### `programExecute`
Called whenever a user starts a program. No payload is passed for this event.

#### `programTerminate`
Called whenever a program terminated. This can be either cause by a user action (the user clicking on the stop program button) or when the program terminated by itself.

Payload:
- `error`: Optional error.

#### `simulationReset`
Called whenever the simulation is reset. No payload is passed for this event.

### SDK documentation
Documentation on the SDK modules can be found in the sdk directory.
