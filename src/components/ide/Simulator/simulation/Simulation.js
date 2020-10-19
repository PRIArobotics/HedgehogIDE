// @flow

import Matter from 'matter-js';
import 'pathseg';
import '../../../../client/poly-decomp-polyfill';

import { Point, Robot, schema } from '.';
import { resolveSprite } from './schema/helpers';

type ExternalSensorHandler = (
  eventName: 'collisionStart' | 'collisionEnd',
  sensor: Matter.Body | Matter.Composite,
  other: Matter.Body | Matter.Composite,
) => void | Promise<void>;

/**
 * Manages a robot simulation.
 * The simulation can contain multiple robots, and objects representing the environment.
 * This class is responsible for managing the Matter.js simulation lifecycle
 * and triggering robot behavior (accelerating the robots, setting values for their sensors).
 */
export default class Simulation {
  world: Matter.World;
  engine: Matter.Engine;
  runner: Matter.Runner;

  render: Matter.Render | null = null;
  bounds: { min: Point, max: Point } | null = null;

  // assets
  assets: Map<string, [string, Uint8Array]> | null = null;

  // special bodies for simulation logic
  robots: Map<string, Robot> = new Map();
  sensorsCache: Set<Matter.Body> = new Set();

  // timers waiting for simulated time to pass
  timers: [number, () => void][] = [];

  externalSensorHandlers: ExternalSensorHandler[] = [];

  constructor() {
    this.world = Matter.World.create({
      gravity: { x: 0, y: 0 },
    });

    this.engine = Matter.Engine.create({ world: this.world });
    this.runner = Matter.Runner.create();

    // robot update on simulation tick
    Matter.Events.on(this.runner, 'beforeUpdate', ({ timestamp }) => {
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
    });

    function extractBodyForSDK({
      id,
      label,
      position,
      speed,
      velocity,
      angle,
      angularSpeed,
      angularVelocity,
      bounds,
    }: Matter.Body) {
      return {
        id,
        label,
        position,
        speed,
        velocity,
        angle,
        angularSpeed,
        angularVelocity,
        bounds,
      };
    }
    // check for line detection
    const collisionHandler = ({ name, pairs }) => {
      for (const { bodyA, bodyB } of pairs) {
        for (const handler of this.externalSensorHandlers) {
          handler(name, extractBodyForSDK(bodyA), extractBodyForSDK(bodyB));
        }

        let sensor = null;
        let other = null;
        if (this.sensorsCache.has(bodyA)) {
          sensor = bodyA;
          other = bodyB;
        } else if (this.sensorsCache.has(bodyB)) {
          sensor = bodyB;
          other = bodyA;
        } else {
          continue;
        }

        sensor.plugin.hedgehog.sensor.handleCollision(name, other);
      }
    };

    Matter.Events.on(this.engine, 'collisionStart', collisionHandler);
    Matter.Events.on(this.engine, 'collisionEnd', collisionHandler);
  }

  async sleep(millis: number): Promise<void> {
    return /* await */ new Promise((resolve) => {
      this.timers.push([this.engine.timing.timestamp + millis, resolve]);
    });
  }

  jsonInit(
    {
      center: { x, y },
      // eslint-disable-next-line no-shadow
      width,
      // eslint-disable-next-line no-shadow
      height,
      objects,
    }: schema.Simulation,
    assets: Map<string, [string, Uint8Array]> | null = null,
  ) {
    this.clear(false);

    this.assets = assets;

    this.lookAt({
      min: { x: x - width / 2, y: y - height / 2 },
      max: { x: x + width / 2, y: y + height / 2 },
    });

    this.jsonAdd(objects);
  }

  jsonAdd(objects: schema.Object[], temporary: boolean = false) {
    for (const object of objects) {
      switch (object.type) {
        case 'rectangle':
        case 'circle':
        case 'svg': {
          try {
            const body = schema.createBody(object, this.assets, temporary);

            this.add([body]);
          } catch (err) {
            console.error(err);
          }

          break;
        }
        case 'robot': {
          const { type: _type, name, ...options } = object;
          resolveSprite(options?.render?.sprite, this.assets);

          this.addRobot(name, new Robot(options));
          break;
        }
        default:
          console.warn('unknown simulation object:', object);
      }
    }

    this.updateSensorCache();
  }

  removeBodies(labels: string[]) {
    const bodiesToRemove = this.world.bodies.filter((body) => labels.includes(body.label));
    for (const body of bodiesToRemove) {
      Matter.World.remove(this.world, body);
    }
  }

  mount(canvas: HTMLCanvasElement) {
    this.unmount();

    const dimension = {};
    if (this.bounds !== null) {
      dimension.width = this.bounds.max.x - this.bounds.min.x;
      dimension.height = this.bounds.max.y - this.bounds.min.y;
    }

    // TODO creating a Render instance with a running Engine will error,
    // as the Engine's internal state is recursive.
    // mount() can therefore not be called after initially starting the simulation
    this.render = Matter.Render.create({
      canvas,
      engine: this.engine,
      options: { ...dimension, wireframes: false, background: '#eeeeee' },
    });
    if (this.bounds !== null) Matter.Render.lookAt(this.render, this.bounds);
  }

  unmount() {
    if (this.render !== null) this.stopRender();
    this.render = null;
  }

  startMatter() {
    Matter.Runner.run(this.runner, this.engine);
  }

  startRender() {
    Matter.Render.run(this.render);
  }

  stopMatter() {
    Matter.Runner.stop(this.runner);
  }

  stopRender() {
    Matter.Render.stop(this.render);
  }

  lookAt(bounds: { min: Point, max: Point }) {
    this.bounds = bounds;
    if (this.render !== null) Matter.Render.lookAt(this.render, bounds);
  }

  add(bodies: (Matter.Body | Matter.Composite)[]) {
    Matter.World.add(this.world, bodies);
  }

  addSensorHandler(handler: ExternalSensorHandler) {
    this.externalSensorHandlers.push(handler);
  }

  addRobot(name: string, robot: Robot) {
    this.robots.set(name, robot);
    this.add(robot.robot);
  }

  // this method has to be called after adding one or more robots to the
  // simulation, before using any new robot's sensors.
  updateSensorCache() {
    this.sensorsCache.clear();
    for (const robot of this.robots.values()) {
      for (const sensor of robot.collisionSensors) {
        this.sensorsCache.add(sensor.sensorBody);
      }
    }
  }

  clear(keepStatic: boolean) {
    Matter.Composite.clear(this.world, keepStatic);
    this.robots.clear();
    this.updateSensorCache();
  }

  reset() {
    const bodiesToRemove = [];

    for (const composite of [
      ...Matter.Composite.allComposites(this.world),
      ...Matter.Composite.allBodies(this.world),
    ]) {
      if (composite.plugin.hedgehog?.initialPose) {
        const { x, y, angle } = composite.plugin.hedgehog.initialPose;
        Matter.Body.setPosition(composite, { x, y });
        Matter.Body.setAngle(composite, angle);
        Matter.Body.setVelocity(composite, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(composite, 0);
      }
      if (composite.plugin.hedgehog?.temporary) {
        bodiesToRemove.push(composite);
      }
    }
    for (const body of bodiesToRemove) {
      Matter.World.remove(this.world, body);
    }
  }
}
