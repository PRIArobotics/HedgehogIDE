// @flow

import merge from 'lodash.merge';

import Matter from 'matter-js';
import 'pathseg';
import '../../../../client/poly-decomp-polyfill';

import { Robot, schema } from '.';

type ExternalSensorHandler = (
  eventName: 'collisionStart' | 'collisionEnd',
  sensor: Matter.Body | Matter.Composite,
  other: Matter.Body | Matter.Composite,
) => void | Promise<void>;

class Scene {
  // config
  schema: schema.Simulation;
  assets: Map<string, [string, Uint8Array]>;

  // matter objects
  world: Matter.World;
  engine: Matter.Engine;

  // special bodies for simulation logic
  robots: Map<string, Robot> = new Map();
  sensorCache: Set<Matter.Body> = new Set();

  // timers waiting for simulated time to pass
  timers: [number, () => void][] = [];

  constructor(schema: schema.Simulation, assets: Map<string, [string, Uint8Array]> = new Map()) {
    this.schema = schema;
    this.assets = assets;

    this.world = Matter.World.create({
      gravity: { x: 0, y: 0 },
    });
    this.engine = Matter.Engine.create({ world: this.world });

    this.jsonAdd(schema.objects);
  }

  jsonAdd(objects: schema.Object[]) {
    for (const object of objects) {
      try {
        if (object.type === 'robot') {
          const { type: _type, name, ...options } = object;

          this.addRobot(name, new Robot(options, this.assets));
        } else {
          // this fails cleanly if the object type is not known
          const body = schema.createBody(object, this.assets);

          this.addBodies([body]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async sleep(millis: number): Promise<void> {
    return /* await */ new Promise((resolve) => {
      this.timers.push([this.engine.timing.timestamp + millis, resolve]);
    });
  }

  addRobot(name: string, robot: Robot) {
    this.robots.set(name, robot);
    this.addBodies(robot.robot);
    for (const sensor of robot.collisionSensors) {
      this.sensorCache.add(sensor.sensorBody);
    }
  }

  addBodies(bodies: (Matter.Body | Matter.Composite)[]) {
    Matter.World.add(this.world, bodies);
  }

  getBodies(labels: string[]): { [label: string]: Matter.Body } {
    const result = {};

    for (const body of this.world.bodies) {
      if (labels.includes(body.label)) result[body.label] = body;
    }

    return result;
  }

  updateBodies(objects: { [label: string]: any }) {
    for (const body of this.world.bodies) {
      const settings = objects[body.label];
      if (settings !== undefined) {
        Matter.Body.set(body, {
          ...settings,
          // merge render, as that encapsulates multiple settings
          render: {
            ...body.render,
            ...settings.render,
            sprite: {
              ...body.render?.sprite,
              ...settings.render?.sprite,
            },
          },
          // also recursively merge plugins, which encapsulate arbitrary data
          plugin: merge({}, body.plugin, settings.plugin),
        });
      }
    }
  }

  removeBodies(labels: string[]) {
    const bodiesToRemove = this.world.bodies.filter((body) => labels.includes(body.label));
    for (const body of bodiesToRemove) {
      Matter.World.remove(this.world, body);
    }
  }

  // "internals"

  beforeUpdate(timestamp: number) {
    for (const robot of this.robots.values()) {
      robot.beforeUpdate();
    }

    this.timers = this.timers.filter(([deadline, resolve]) => {
      // keep timers that have not yet expired
      if (deadline > timestamp) return true;

      // process the timer and remove
      resolve();
      return false;
    });
  }

  onCollision(name: 'collisionStart' | 'collisionEnd', bodyA: Matter.Body, bodyB: Matter.Body) {
    let sensor = null;
    let other = null;
    if (this.sensorCache.has(bodyA)) {
      sensor = bodyA;
      other = bodyB;
    } else if (this.sensorCache.has(bodyB)) {
      sensor = bodyB;
      other = bodyA;
    } else {
      return;
    }

    sensor.plugin.hedgehog.sensor.handleCollision(name, other);
  }
}

/**
 * Manages a robot simulation.
 * The simulation can contain multiple robots, and objects representing the environment.
 * This class is responsible for managing the Matter.js simulation lifecycle
 * and triggering robot behavior (accelerating the robots, setting values for their sensors).
 */
export default class Simulation {
  runner: Matter.Runner;

  scene: Scene | null = null;
  render: Matter.Render | null = null;

  externalSensorHandlers: ExternalSensorHandler[] = [];

  constructor() {
    this.runner = Matter.Runner.create();

    // robot update on simulation tick
    Matter.Events.on(this.runner, 'beforeUpdate', ({ timestamp }) => {
      // eslint-disable-next-line no-throw-literal
      if (this.scene === null) throw 'unreachable';

      this.scene.beforeUpdate(timestamp);
    });
  }

  createScene(schema: schema.Simulation, assets?: Map<string, [string, Uint8Array]>) {
    this.destroyScene();

    const scene = new Scene(schema, assets);
    this.scene = scene;

    const collisionHandler = ({ name, pairs }) => {
      for (const { bodyA, bodyB } of pairs) {
        for (const handler of this.externalSensorHandlers) {
          handler(name, bodyA, bodyB);
        }

        scene.onCollision(name, bodyA, bodyB);
      }
    };

    Matter.Events.on(scene.engine, 'collisionStart', collisionHandler);
    Matter.Events.on(scene.engine, 'collisionEnd', collisionHandler);
  }

  startMatter() {
    if (this.scene === null) throw new Error("can only start the simulation when there's a scene");

    Matter.Runner.run(this.runner, this.scene.engine);
  }

  stopMatter() {
    Matter.Runner.stop(this.runner);
  }

  destroyScene() {
    this.unmount();
    this.stopMatter();

    // TODO avoid leaking anything set up in the scene

    this.scene = null;
  }

  mount(canvas: HTMLCanvasElement) {
    const scene = this.scene;
    if (scene === null) throw new Error("can only mount the simulation when there's a scene");

    this.unmount();

    const { center, width, height } = scene.schema;

    // TODO creating a Render instance with a running Engine will error,
    // as the Engine's internal state is recursive.
    // mount() can therefore not be called after initially starting the simulation
    this.render = Matter.Render.create({
      canvas,
      engine: scene.engine,
      options: { width, height, wireframes: false, background: '#eeeeee' },
    });

    Matter.Render.lookAt(this.render, {
      min: { x: center.x - width / 2, y: center.y - height / 2 },
      max: { x: center.x + width / 2, y: center.y + height / 2 },
    });
  }

  startRender() {
    if (this.render === null) throw new Error('can only start rendering when mounted');

    Matter.Render.run(this.render);
  }

  stopRender() {
    Matter.Render.stop(this.render);
  }

  unmount() {
    if (this.render !== null) this.stopRender();
    this.render = null;
  }

  getScene(): Scene {
    if (this.scene === null) throw new Error("no current scene");
    return this.scene;
  }

  addSensorHandler(handler: ExternalSensorHandler) {
    if (!this.externalSensorHandlers.includes(handler)) {
      this.externalSensorHandlers.push(handler);
    }
  }

  removeSensorHandler(handler: ExternalSensorHandler) {
    const index = this.externalSensorHandlers.indexOf(handler);
    if (index !== -1) {
      this.externalSensorHandlers.splice(index, 1);
    }
  }
}
