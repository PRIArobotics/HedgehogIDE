# Simulation SDK
The Simulation SDK enables access to the simulation environment.

## Functions
#### `sdk.simulation.add(objects: schema.Object[])`
Adds multiple objects to the simulation. Objects are given in the same form as they appear in the simulator editor's JSON output.

#### `async sdk.simulation.get(labels: string[]): {[label: string]: ObjectProps}`
Returns properties of the given named simulation objects. For example, to get the properties of objects `'foo'` and `'bar'`, this could be called like

```ts
const { foo, bar } = await sdk.simulation.get(['foo', 'bar']);
```

Both `foo` and `bar` will then conform to the following type:

```ts
type ObjectProps = {
  id: number,
  label: string,
  position: { x: number, y: number },
  speed: number,
  velocity: { x: number, y: number },
  angle: number,
  angularSpeed: number,
  angularVelocity: number,
  bounds: {
    min: { x: number, y: number },
    max: { x: number, y: number },
  },
};
```

#### `sdk.simulation.update(objects: {[label: string]: any})`
Updates properties of multiple objects in the simulation. For each label, the value is an object with any number of properties to update in the object, e.g.: `angle`, `density`, `frictionAir`, `plugin` (for storing arbitrary properties), `position`, `render`. The complete list can be found [here](https://brm.io/matter-js/docs/classes/Body.html#properties) - be aware that some properties are computed and should therefore not be overwritten, and that there are properties that can be set that are not reported by `get` for performance reasons.

The given `plugin` property is set on the body using deep merging, as it can hold arbitrary independent data. The `render` and `render.sprite` properties similarly hold independent settings, and are merged shallowly (i.e. setting `render.x` preserves `render.y`, but not `render.x.y`).

#### `sdk.simulation.remove(labels: string[])`
Removes all objects from the simulation that have one of the given labels.

## Events

#### `sdk.simulation.on('collision', ({ eventName, bodyA, bodyB }) => {})`
Called whenever objects collide within the simulation. Internally this event is coupled with the `collisionStart` and `collisionEnd` of the underlying MatterJS Engine (see https://brm.io/matter-js/docs/classes/Engine.html#events).

This event is trigger for *every* collision which occurs within the simulation, expect that the handle will be called very frequently, therefore keep the handler as short as possible. There are also specific events which are only triggered for collisions where a body with a specific label is involved as described below.

**Tip:** When debugging, it can be useful to log with which collision events your handler is called. This will lead to very frequent logs, and using `sdk.misc.print` for this will make the simulation laggy. For this reason, prefer `console.log`. You can see the output in your browser's devloper tools
([Firefox](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools#the_javascript_console),
[Chrome](https://developer.chrome.com/docs/devtools/open/#console),
[Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/open/?tabs=cmd-Windows#open-the-console-panel)).

- `eventName`: `collisionStart` or `collisionEnd`, depending on the event
- `bodyA`: First body of the collision pair.
- `bodyB`: Second body of the collision pair.

#### `sdk.simulation.on('collision_<BODY-LABEL>', ({ eventName, bodyA, bodyB }) => {})`
Same as `collision`, but this event is only triggered for collisions where a body with the given label is involved. The body with the matching label is always `bodyA`.

#### `collision_start`, `collision_end`, `collision_start_<BODY-LABEL>`, `collision_end_<BODY-LABEL>`
Same as above, but these events are only triggered for either `collisionStart` or `collisionEnd` events, respectively. The payload does include the `eventName`, even though it is redundant.
