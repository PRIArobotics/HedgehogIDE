// @flow

import Matter from 'matter-js';

import * as SimulationSchema from '../SimulatorEditor/SimulationSchema';

export type Point = {|
  x: number,
  y: number,
|};

export type Pose = {|
  x: number,
  y: number,
  angle: number,
|};

// function transform(
//   { x, y, angle }: Pose,
//   { x: dx, y: dy, angle: dangle }: Pose,
// ): Pose {
//   const cos = Math.cos(angle);
//   const sin = Math.sin(angle);
//   return {
//     x: x + cos * dx - sin * dy,
//     y: y + sin * dx + cos * dy,
//     angle: angle + dangle,
//   };
// }

export class Robot {
  leftWheel: Matter.Body;
  rightWheel: Matter.Body;
  // leftGrabberControl: Matter.Constraint;
  // rightGrabberControl: Matter.Constraint;
  lineSensors: Matter.Body[];
  touchSensors: Matter.Body[];
  body: Matter.Body;

  bodies: Matter.Body[];

  // Array.from({ length: n }, (v, i) => ...):
  // first parameter is array-like, so `length` is an array length
  // all values (`v`) are `undefined`, map them to something else.

  // motor (port = 0..4) power, -100..=100
  motors: number[] = Array.from({ length: 4 }, () => 0);
  // servo (port = 0..6) positions, 0..=1000 or null
  servos: (number | null)[] = Array.from({ length: 6 }, () => null);
  // sensor (port = 0..16) value inferred from the simulation
  // the value here is "exact"; an analog value read by a user program should
  // have some noise applied to it
  sensors: number[] = Array.from({ length: 16 }, () => 4095);

  constructor() {
    this.initBody();
  }

  initBody() {
    const pluginData = (data: { robot?: Robot }) => ({
      plugin: {
        hedgehog: {
          robot: this,
          ...data,
        },
      },
    });

    const material = {
      density: 1,
      frictionAir: 0.4,
    };
    // const materialGrabber = {
    //   density: 0.02,
    //   frictionAir: 0,
    // };
    const styleWheel = {
      render: {
        fillStyle: '#777777',
      },
    };
    const styleBody = {
      render: {
        fillStyle: '#38b449',
        // sprite: {
        //   texture: '/icon.png',
        // },
      },
    };
    const styleLineSensor = {
      render: {
        fillStyle: '#777777',
      },
    };
    const styleTouchSensor = {
      render: {
        fillStyle: '#777777',
      },
    };
    // const styleGrabber = {
    //   render: {
    //     fillStyle: '#777777',
    //   },
    // };

    this.leftWheel = Matter.Bodies.rectangle(7, -21, 20, 4, {
      ...material,
      ...styleWheel,
      label: 'leftWheel',
    });
    this.rightWheel = Matter.Bodies.rectangle(7, 21, 20, 4, {
      ...material,
      ...styleWheel,
      label: 'rightWheel',
    });
    const body = Matter.Bodies.rectangle(0, 0, 40, 32, {
      ...material,
      ...styleBody,
      label: 'bodyPart',
    });
    this.lineSensors = [
      Matter.Bodies.circle(22, -22, 2, {
        ...material,
        ...styleLineSensor,
        ...pluginData({ sensorPort: 0, collisionCount: 0 }),
        label: 'leftLineSensor',
      }),
      Matter.Bodies.circle(22, -8, 2, {
        ...material,
        ...styleLineSensor,
        ...pluginData({ sensorPort: 1, collisionCount: 0 }),
        label: 'centerLeftLineSensor',
      }),
      Matter.Bodies.circle(22, 8, 2, {
        ...material,
        ...styleLineSensor,
        ...pluginData({ sensorPort: 2, collisionCount: 0 }),
        label: 'centerRightLineSensor',
      }),
      Matter.Bodies.circle(22, 22, 2, {
        ...material,
        ...styleLineSensor,
        ...pluginData({ sensorPort: 3, collisionCount: 0 }),
        label: 'rightLineSensor',
      }),
    ];
    this.touchSensors = [
      Matter.Bodies.rectangle(24, 0, 3, 32, {
        ...material,
        ...styleTouchSensor,
        ...pluginData({ sensorPort: 8, collisionCount: 0 }),
        label: 'frontTouchSensor',
      }),
    ];
    this.body = Matter.Body.create({
      parts: [this.leftWheel, this.rightWheel, ...this.lineSensors, ...this.touchSensors, body],
      ...material,
      label: 'body',
      plugin: {},
    });

    // const pivotProperties = (
    //   anchor: Matter.Body,
    //   pivotAnchor: Pose,
    //   arm: Matter.Body,
    //   pivotArm: Pose,
    //   length: number,
    // ) => {
    //   return {
    //     bodyA: anchor,
    //     pointA: { x: pivotAnchor.x, y: pivotAnchor.y },
    //     bodyB: arm,
    //     pointB: { x: pivotArm.x, y: pivotArm.y },
    //     length: 0,
    //   };
    // };

    // const controlProperties = (
    //   anchor: Matter.Body,
    //   pivotAnchor: Pose,
    //   arm: Matter.Body,
    //   pivotArm: Pose,
    //   length: number,
    // ) => {
    //   const translation = { x: length, y: 0, angle: 0 };
    //   const controlAnchor = transform(pivotAnchor, translation);
    //   const controlArm = transform(pivotArm, translation);

    //   return {
    //     bodyA: anchor,
    //     pointA: { x: controlAnchor.x, y: controlAnchor.y },
    //     bodyB: arm,
    //     pointB: { x: controlArm.x, y: controlArm.y },
    //     length: 0,
    //     // TODO this does nothing, see https://github.com/liabru/matter-js/issues/817
    //     ...pluginData({ pivot: leftGrabberPivot, length: length }),
    //   };
    // };

    // // pivot pose in body coords
    // const leftGrabberPivot = { x: 55, y: -35, angle: 0 };
    // const rightGrabberPivot = { x: 55, y: 35, angle: 0 };
    // // pivot pose in arm coords
    // const grabberPivotArm = { x: -30, y: 0, angle: 0 };

    // const leftGrabber = Matter.Bodies.rectangle(185, 65, 60, 5, {
    //   ...materialGrabber,
    //   ...styleGrabber,
    // });

    // const rightGrabber = Matter.Bodies.rectangle(185, 135, 60, 5, {
    //   ...materialGrabber,
    //   ...styleGrabber,
    // });

    // this.leftGrabberControl = Matter.Constraint.create({
    //   ...controlProperties(this.body, leftGrabberPivot, leftGrabber, grabberPivotArm, 30),
    //   stiffness: 0.1,
    //   damping: 0.9,
    //   render: { visible: false },
    // });
    // this.rightGrabberControl = Matter.Constraint.create({
    //   ...controlProperties(this.body, rightGrabberPivot, rightGrabber, grabberPivotArm, 30),
    //   stiffness: 0.1,
    //   damping: 0.9,
    //   render: { visible: false },
    // });
    // // TODO workaround for https://github.com/liabru/matter-js/issues/817
    // this.leftGrabberControl.plugin.hedgehog = pluginData({ pivot: leftGrabberPivot, length: 30 }).plugin.hedgehog;
    // this.rightGrabberControl.plugin.hedgehog = pluginData({ pivot: rightGrabberPivot, length: 30 }).plugin.hedgehog;

    // this.setGrabberControls(500, 500);

    const bot = Matter.Composite.create({
      parts: [this.body /* , leftGrabber, rightGrabber */],
      constraints: [
        // // left grabber pivot
        // Matter.Constraint.create({
        //   ...pivotProperties(this.body, leftGrabberPivot, leftGrabber, grabberPivotArm, 30),
        //   stiffness: 0.7,
        //   damping: 0.9,
        //   render: { visible: false },
        // }),
        // this.leftGrabberControl,
        // // right grabber pivot
        // Matter.Constraint.create({
        //   ...pivotProperties(this.body, rightGrabberPivot, rightGrabber, grabberPivotArm, 30),
        //   stiffness: 0.7,
        //   damping: 0.9,
        //   render: { visible: false },
        // }),
        // this.rightGrabberControl,
      ],
      label: 'bot',
    });

    this.bodies = [bot, ...bot.parts];

    // line sensors are not collided by default!
    this.sensors[0] = 100;
    this.sensors[1] = 100;
    this.sensors[2] = 100;
    this.sensors[3] = 100;
  }

  // setGrabberControls(
  //   leftPosition: number | null,
  //   rightPosition: number | null,
  // ) {
  //   const applyTransform = (control: Matter.Constraint, position: number) => {
  //     const { pivot, length } = control.plugin.hedgehog;
  //     // position 0..=1000 should be translated into angle -90°..=90°
  //     // 0..=1000 -> -500..=500 -> -1/2..=1/2 -> PI/2..=PI/2
  //     const dAngle = ((position - 500) / 1000) * Math.PI;
  //     const { x, y } = transform({ ...pivot, angle: pivot.angle+dAngle }, { x: length, y: 0, angle: 0 });

  //     // eslint-disable-next-line no-param-reassign
  //     control.pointA = { x, y };
  //   };

  //   if (leftPosition !== null)
  //     applyTransform(this.leftGrabberControl, leftPosition);
  //   if (rightPosition !== null)
  //     applyTransform(this.rightGrabberControl, rightPosition);
  // }

  setPose({ x, y, angle }: Pose) {
    Matter.Body.setPosition(this.body, { x, y });
    Matter.Body.setAngle(this.body, angle);
  }

  setInitialPose(pose: Pose) {
    this.body.plugin = {
      hedgehog: {
        initialPose: pose,
      },
    };
  }

  applyForce(pos: Point, force: number, cos: number, sin: number) {
    Matter.Body.applyForce(this.body, pos, {
      x: force * cos,
      y: force * sin,
    });
  }

  setSpeed(left: number, right: number) {
    this.moveMotor(0, left);
    this.moveMotor(1, right);
  }

  beforeUpdate() {
    const lPos = this.leftWheel.position;
    const rPos = this.rightWheel.position;
    const dx = lPos.x - rPos.x;
    const dy = lPos.y - rPos.y;
    const hypot = Math.hypot(dx, dy);

    // cosine and sine of the angle in which the forces are directed
    // this is normal to the axis of the wheels, therefore [-dy, dx] instead of [dx, dy]
    const cos = -dy / hypot;
    const sin = dx / hypot;

    this.applyForce(lPos, this.motors[0] / 800, cos, sin);
    this.applyForce(rPos, this.motors[1] / 800, cos, sin);
  }

  handleLineSensor(eventName: 'collisionStart' | 'collisionEnd', sensor: Matter.Body) {
    const plugin = sensor.plugin.hedgehog;
    switch (eventName) {
      case 'collisionStart':
        plugin.collisionCount += 1;
        break;
      case 'collisionEnd':
        plugin.collisionCount -= 1;
        break;
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
    this.sensors[plugin.sensorPort] = plugin.collisionCount > 0 ? 4000 : 100;
  }

  handleTouchSensor(eventName: 'collisionStart' | 'collisionEnd', sensor: Matter.Body) {
    const plugin = sensor.plugin.hedgehog;
    switch (eventName) {
      case 'collisionStart':
        plugin.collisionCount += 1;
        break;
      case 'collisionEnd':
        plugin.collisionCount -= 1;
        break;
      default:
        // eslint-disable-next-line no-throw-literal
        throw 'unreachable';
    }
    this.sensors[plugin.sensorPort] = plugin.collisionCount === 0 ? 4095 : 0;
  }

  moveMotor(port: number, power: number) {
    this.motors[port] = power;
  }

  setServo(port: number, position: number | null) {
    this.servos[port] = position;

    // if (port === 0 || port === 1) {
    //   this.setGrabberControls(this.servos[0], this.servos[1]);
    // }
  }

  getAnalog(port: number): number {
    // TODO noise
    const noise = 0;
    const result = this.sensors[port] + noise;

    if (result > 4095) return 4095;
    if (result < 0) return 0;
    return result;
  }

  getDigital(port: number): boolean {
    return this.getAnalog(port) > 2047;
  }
}

type SensorCache = {|
  lineSensors: Matter.Body[],
  touchSensors: Matter.Body[],
|};
type ExternalSensorHandler = (
  sensor: Matter.Body | Matter.Composite,
  other: Matter.Body | Matter.Composite,
) => void | Promise<void>;

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
