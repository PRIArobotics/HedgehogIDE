# Misc SDK
The Misc SDK contains general IDE functionality that is not associated with any other particular component.

## Functions

#### `sdk.misc.print(text: string)`
Prints a text to the IDE's console.

- `text: string`: The text to print.

#### `async sdk.misc.getInput(): string`
Waits for and reads a line from the IDE's console.

#### `async sdk.misc.getBestLocale(localeOptions: string[]): string | null`
Selects the best locale for the user from among the given options. If none of the options is fitting, returns `null`.

A typical pattern for using this is like so:

```ts
const messages = {
  de: {
    msg: "Nachricht",
  },
  en: {
    msg: "message",
  },
};

const m = messages[await sdk.misc.getBestLocale(Object.keys(messages)) || "en"];
```

This code
- declares a number of translations for the necessary messages (here only `msg`)
- selects the most fitting translation for the user
- falls back to the `en` locale if neither of the available locales was fitting
- provides all messages in the `m` variable.

Subsequent code can access messages like `m.msg`.

- `localeOptions: string[]`: The locales to choose from.

#### `sdk.misc.exit(error: string | void)`
Informs the IDE that the program/plugin is done and its sandbox can be cleaned up. This happens automatically when the program/plugin terminates, *if* no listeners are registered, and therefore it is seldom necessary to call this manually. However, a plugin that has registered event listeners *can* call this manually when it has fulfilled its purpose and does not need to continue running.

- `error: string | void`: An error message if the program/plugin terminated because of an error.

#### `sdk.misc.pluginReady()`
Some features and functions of the SDK require to be executed before the IDE workspace is fully initialized. Therefore, plugins need to signal that all initialization code is complete by calling this function, so that the IDE can complete the initialization phase. For details, see the [Plugins](../plugins.md) documentation.

*IMPORTANT*: Every plugin MUST call this function after performing any of the early stage SDK calls, even those which do not perform any initialization-phase SDK calls at all.

#### `sdk.misc.registerCall(command: string, cb: (payload: any) => void)`
Register a command handler. The IDE or other programs/plugins can call the command by name. The command sends no response to the caller.

- `command`: Function name
- `cb`: Handler function which will be called when the command is invoked

#### `sdk.misc.registerCallWithReply(command: string, cb: (payload: any) => any)`
Register a command handler that returns a result.

- `command`: Function name
- `cb`: Handler function which will be called when the command is invoked

## Events

#### `sdk.misc.on('programExecute', () => {})`
Called whenever a user starts a program.

No payload is passed for this event.

#### `sdk.misc.on('programTerminate', ({ error }) => {})`
Called whenever a program terminated. This can be either caused by a user action (the user clicking on the stop program button) or when the program terminated by itself.

- `error: string | void`: The error, if any, that caused the program to terminate.


#### `sdk.misc.on('simulationReset', () => {})`
Called whenever the simulation is reset.

No payload is passed for this event.
