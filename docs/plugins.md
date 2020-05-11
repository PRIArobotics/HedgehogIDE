# Plugins
Plugins allow developers to extend the functionality of Hedgehog IDE.

## Writing plugins
Plugins are currently attached to projects and are located in a folder called `plugins` within the project's metadata (names `.metadata`) folder, every plugin consists of exactly one file within the plugin directory. To create a new plugin, simply create a JavaScript file in the plugin folder, Hedgehog IDE will automatically load the plugin when loading the project.

## SDK and plugin structure
For security reasons, plugins run (as normal user programs also do) in an sandboxed environment and interact with Hedgehog IDE and its component via an SDK.

The SDK is module based, every module enables interaction with a specific aspect of the IDE. To do so, each module contains two kinds of primitives, Functions and Events.
- *Functions*: Functions enable synchronous interaction initiated by the plugin (communication from plugin to IDE). Values exchanged between IDE and plugin (function arguments and return values) are limited to basic types including primitives, simple objects (Direct JavaScript `Object` instances, e.g. object literals) and arrays.
- *Events*: Events primarily enable plugins to be notified upon and react to things happening in the IDE (e.g. a program being started). They therefore enable communication from the IDE to plugins. Every modules has its own scope of events and plugins can subscribe to events via the `on` function of the according module.

The sdk modules are exposed as properties of the global variable `sdk`. For instance, to access the function `addBlock` of the `blockly` module, write `sdk.blockly.addBlock`.

### Core plugin functions
#### `sdk.<MODULE>.on(event: string, cb: (payload: any) => void)`
Register an event handler.

Arguments:
- `event`: Event name
- `cb`: Handler function which will be called when the event occurs

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

### SDK documentation
Documentation on the SDK modules can be found in the sdk directory.
