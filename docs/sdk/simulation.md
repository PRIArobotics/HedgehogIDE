# Simulation SDK
The Simulation SDK enables access to the simulation environment.

## Functions
#### `sdk.simulation.add(objects: SimulationSchema.Object[])`
Adds multiple objects to the simulation. Objects are given in the same form as they appear in the simulator editor's JSON output. Note that right now, added objects will not be removed when resetting the simulation.

#### `sdk.simulation.remove(label: string)`
Removes all objects from the simulation that have the given exact label. Note that right now, removed objects will not be re-added when resetting the simulation.

## Events
#### `collision`
Called whenever objects collide within the simulation. Internally this event if coupled with the `collisionStart` and `collisionEnd` of the underlying MatterJS Engine (see https://brm.io/matter-js/docs/classes/Engine.html#events).

This event is trigger for *every* collision which occurs within the simulation, expect that the handle will be called very frequently, therefore keep the handler as short as possible. There are also specific events which are only triggered for collisions where a body with a specific label is involved as described below.

Payload:
- `bodyA`: First body of the collision pair.
- `bodyB`: Second body of the collision pair.

#### `collision_<BODY-LABEL>`
Same as `collision`, but this event is only triggered for collisions where a body with the given label is involved. The body with the matching label is always `bodyA`.
