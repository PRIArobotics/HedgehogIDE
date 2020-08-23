// @flow

import Matter from 'matter-js';

import { Point, Pose, Robot } from '.';
import * as SimulationSchema from '../../SimulatorEditor/SimulationSchema';

type ExternalSensorHandler = (
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

  // special bodies for simulation logic
  robots: Map<string, Robot> = new Map<string, Robot>();
  sensorsCache: Set<Matter.Body> = new Set<Matter.Body>();

  externalSensorHandlers: ExternalSensorHandler[] = [];

  constructor() {
    this.world = Matter.World.create({
      gravity: { x: 0, y: 0 },
    });

    this.engine = Matter.Engine.create({ world: this.world });
    this.runner = Matter.Runner.create();

    // robot update on simulation tick
    Matter.Events.on(this.runner, 'beforeUpdate', () => {
      for (const robot of this.robots.values()) {
        robot.beforeUpdate();
      }
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
          handler(extractBodyForSDK(bodyA), extractBodyForSDK(bodyB));
        }

        let sensor;
        let other;
        if (this.sensorsCache.has(bodyA)) {
          sensor = bodyA;
          other = bodyB;
        } else if (this.sensorsCache.has(bodyB)) {
          sensor = bodyB;
          other = bodyA;
        } else {
          return;
        }

        sensor.plugin.hedgehog.sensor.handleCollision(name, other);
      }
    };

    Matter.Events.on(this.engine, 'collisionStart', collisionHandler);
    Matter.Events.on(this.engine, 'collisionEnd', collisionHandler);
  }

  jsonInit(schema: SimulationSchema.SimulatorJson) {
    this.clear(false);

    {
      const {
        center: { x, y },
        // eslint-disable-next-line no-shadow
        width,
        // eslint-disable-next-line no-shadow
        height,
      } = schema.simulation;
      this.lookAt({
        min: { x: x - width / 2, y: y - height / 2 },
        max: { x: x + width / 2, y: y + height / 2 },
      });
    }

    for (const object of schema.objects) {
      switch (object.type) {
        case 'rectangle': {
          // eslint-disable-next-line no-shadow
          const { type: _type, width, height, ...options } = object;
          const body = Matter.Bodies.rectangle(0, 0, width, height, options);

          this.add([body]);
          break;
        }
        case 'circle': {
          const { type: _type, radius, ...options } = object;
          const body = Matter.Bodies.circle(0, 0, radius, options);

          this.add([body]);
          break;
        }
        case 'robot': {
          const {
            name,
            position: { x, y },
            angle,
            // color,
          } = object;
          const robot = new Robot();
          const pose = { x, y, angle };
          robot.setPose(pose);
          robot.setInitialPose(pose);
          // TODO color

          this.addRobot(name, robot);
          break;
        }
        default:
          console.warn('unknown simulation object:', object);
      }
    }

    this.updateSensorCache();
  }

  mount(element: Element, width: number, height: number) {
    this.unmount();

    // TODO creating a Render instance with a running Engine will error,
    // as the Engine's internal state is recursive.
    // mount() can therefore not be called after initially starting the simulation
    this.render = Matter.Render.create({
      element,
      engine: this.engine,
      options: { width, height, wireframes: false, background: '#eeeeee' },
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
    this.add(robot.bodies);
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
    for (const composite of [
      ...Matter.Composite.allComposites(this.world),
      ...Matter.Composite.allBodies(this.world),
    ]) {
      if (composite.plugin.hedgehog?.initialPose) {
        const { x, y, angle } = composite.plugin.hedgehog.initialPose;
        Matter.Body.setPosition(composite, { x, y });
        Matter.Body.setAngle(composite, angle);
      }
    }
  }
}
