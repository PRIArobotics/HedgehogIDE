// @flow

import Matter from 'matter-js';

import { Point, Pose, Robot } from '.';
import * as SimulationSchema from '../../SimulatorEditor/SimulationSchema';

type SensorCache = {|
  lineSensors: Matter.Body[],
  touchSensors: Matter.Body[],
|};
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
export class Simulation {
  world: Matter.World;
  engine: Matter.Engine;
  runner: Matter.Runner;

  render: Matter.Render | null = null;
  bounds: { min: Point, max: Point } | null = null;

  // special bodies for simulation logic
  robots: Map<string, Robot> = new Map<string, Robot>();
  lines: (Matter.Body | Matter.Composite)[] = [];
  sensorsCache: SensorCache = {
    lineSensors: [],
    touchSensors: [],
  };

  externalSensorHandlers: ExternalSensorHandler[] = [];

  constructor() {
    this.world = Matter.World.create({
      gravity: { x: 0, y: 0 },
    });

    this.engine = Matter.Engine.create({ world: this.world });
    this.runner = Matter.Runner.create();

    // robot update on simulation tick
    Matter.Events.on(this.runner, 'beforeUpdate', () => {
      this.robots.forEach(robot => {
        robot.beforeUpdate();
      });
    });

    // check for line detection
    const collisionHandler = ({ name, pairs }) => {
      pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        this.externalSensorHandlers.forEach(h =>
          h(
            {
              id: bodyA.id,
              label: bodyA.label,
              position: bodyA.position,
              speed: bodyA.speed,
              velocity: bodyA.velocity,
              angle: bodyA.angle,
              angularSpeed: bodyA.angularSpeed,
              angularVelocity: bodyA.angularVelocity,
              bounds: bodyA.bounds,
            },
            {
              id: bodyB.id,
              label: bodyB.label,
              position: bodyB.position,
              speed: bodyB.speed,
              velocity: bodyB.velocity,
              angle: bodyB.angle,
              angularSpeed: bodyB.angularSpeed,
              angularVelocity: bodyB.angularVelocity,
              bounds: bodyB.bounds,
            },
          ),
        );

        let collision = null;
        // go over all types of sensors in the cache,
        // find out if the collision pair has that sensor.
        // there's only one sensor in the collision pair,
        // so there's no hazard of overwriting a collision through forEach
        Object.keys(this.sensorsCache).forEach(key => {
          const sensors = this.sensorsCache[key];
          if (sensors.includes(bodyA)) {
            collision = {
              type: key,
              sensor: bodyA,
              other: bodyB,
            };
          } else if (sensors.includes(bodyB)) {
            collision = {
              type: key,
              sensor: bodyB,
              other: bodyA,
            };
          }
        });
        if (collision === null) return;
        const { type, sensor, other } = collision;

        // handle collision according to the type
        if (type === 'lineSensors' && this.lines.includes(other)) {
          sensor.plugin.hedgehog.robot.handleLineSensor(name, sensor);
        } else if (type === 'touchSensors' && !this.lines.includes(other)) {
          sensor.plugin.hedgehog.robot.handleTouchSensor(name, sensor);
        }
      });
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

    schema.objects.forEach(object => {
      switch (object.type) {
        case 'rectangle': {
          // eslint-disable-next-line no-shadow
          const { type: _type, width, height, ...options } = object;
          const body = Matter.Bodies.rectangle(0, 0, width, height, options);

          this.add([body]);
          // TODO with this, being a sensor (non-colliding)
          // and being a line (dark surface) re the same thing
          if (options.isSensor) this.lines.push(body);
          break;
        }
        case 'circle': {
          const { type: _type, radius, ...options } = object;
          const body = Matter.Bodies.circle(0, 0, radius, options);

          this.add([body]);
          // TODO with this, being a sensor (non-colliding)
          // and being a line (dark surface) re the same thing
          if (options.isSensor) this.lines.push(body);
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
    });

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
    const robots = [...this.robots.values()];
    Object.keys(this.sensorsCache).forEach(key => {
      // $FlowExpectError
      this.sensorsCache[key] = robots.flatMap(robot => robot[key]);
    });
  }

  clear(keepStatic: boolean) {
    Matter.Composite.clear(this.world, keepStatic);
    this.robots.clear();
    this.lines = [];
    this.updateSensorCache();
  }

  reset() {
    [
      ...Matter.Composite.allComposites(this.world),
      ...Matter.Composite.allBodies(this.world),
    ].forEach(composite => {
      if (composite.plugin?.hedgehog?.initialPose) {
        const { x, y, angle } = composite.plugin.hedgehog.initialPose;
        Matter.Body.setPosition(composite, { x, y });
        Matter.Body.setAngle(composite, angle);
      }
    });
  }
}