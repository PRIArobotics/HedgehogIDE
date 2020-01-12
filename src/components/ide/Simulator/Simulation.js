// @flow

import Matter from 'matter-js';

type Point = {|
  x: number,
  y: number,
|};

type Pose = {|
  x: number,
  y: number,
  angle: number,
|};

export class Robot {
  leftWheel: Matter.Body;
  rightWheel: Matter.Body;
  leftGrabberControl: Matter.Constraint;
  surfaceSensors: Array<Matter.Body>;
  body: Matter.Body;

  bodies: Array<Matter.Body>;

  // Array.from({ length: n }, (v, i) => ...):
  // first parameter is array-like, so `length` is an array length
  // all values (`v`) are `undefined`, map them to something else.

  // motor (port = 0..4) power, -100..=100
  motors: Array<number> = Array.from({ length: 4 }, () => 0);
  // servo (port = 0..6) positions, 0..=1000 or null
  servos: Array<number | null> = Array.from({ length: 6 }, () => null);
  // sensor (port = 0..16) value inferred from the simulation
  // the value here is "exact"; an analog value read by a user program should
  // have some noise applied to it
  sensors: Array<number> = Array.from({ length: 16 }, () => 0);

  constructor() {
    this.initBody();
  }

  initBody() {
    const pluginData = (data: {}) => ({
      plugin: {
        hedgehog: {
          robot: this,
          ...data,
        },
      },
    });
    const material = {
      density: 0.3,
      frictionAir: 0.4,
    };
    const grabberMaterial = {
      density: 0.02,
      frictionAir: 0,
    };
    const wheelStyle = {
      render: {
        fillStyle: '#777777',
      },
    };
    const bodyStyle = {
      render: {
        fillStyle: '#38b449',
        // sprite: {
        //   texture: '/icon.png',
        // },
      },
    };
    const sensorStyle = {
      render: {
        fillStyle: '#777777',
      },
    };

    this.leftWheel = Matter.Bodies.rectangle(20, -50, 30, 20, {
      ...material,
      ...wheelStyle,
      ...pluginData({ motorPort: 0 }),
    });
    this.rightWheel = Matter.Bodies.rectangle(20, 50, 30, 20, {
      ...material,
      ...wheelStyle,
      ...pluginData({ motorPort: 1 }),
    });
    const body = Matter.Bodies.rectangle(0, 0, 100, 70, {
      ...material,
      ...bodyStyle,
    });
    this.surfaceSensors = [
      Matter.Bodies.circle(49, -20, 4, {
        ...material,
        ...sensorStyle,
        ...pluginData({ sensorPort: 0, collisionCount: 0 }),
      }),
      Matter.Bodies.circle(50, 0, 4, {
        ...material,
        ...sensorStyle,
        ...pluginData({ sensorPort: 1, collisionCount: 0 }),
      }),
      Matter.Bodies.circle(49, 20, 4, {
        ...material,
        ...sensorStyle,
        ...pluginData({ sensorPort: 2, collisionCount: 0 }),
      }),
    ];
    this.body = Matter.Body.create({
      parts: [this.leftWheel, this.rightWheel, ...this.surfaceSensors, body],
      ...material,
    });

    const leftGrabber = Matter.Bodies.rectangle(180, 50, 60, 5, {
      ...grabberMaterial,
      ...bodyStyle,
      // collisionFilter: { mask: 0 },
    });

    // pointA is a dummy value, is calculated afterwards
    this.leftGrabberControl = Matter.Constraint.create({
      bodyA: this.body,
      pointA: { x: 85, y: -35 },
      bodyB: leftGrabber,
      pointB: { x: 0, y: 0 },
      length: 0,
      stiffness: 0.7,
      damping: 0.9,
      // render: { visible: false },
    });
    this.setGrabberControls(500, 500);

    const bot = Matter.Composite.create({
      parts: [this.body, leftGrabber],
      constraints: [
        // left grabber pivot
        Matter.Constraint.create({
          bodyA: this.body,
          pointA: { x: 55, y: -35 },
          bodyB: leftGrabber,
          pointB: { x: -30, y: 0 },
          length: 0,
          stiffness: 0.7,
          damping: 0.9,
          // render: { visible: false },
        }),
        this.leftGrabberControl,
      ],
    });

    this.bodies = [bot, ...bot.parts];
  }

  setGrabberControls(leftPosition: number | null, rightPosition: number | null) {
    const transform = (
      { x, y, angle }: Pose,
      { x: dx, y: dy, angle: dangle }: Pose,
    ): Pose => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: x + cos * dx - sin * dy,
        y: y + sin * dx + cos * dy,
        angle: angle + dangle,
      };
    };

    const applyTransform = (control: Matter.Constraint, position: number) => {
      const pivot = { x: 55, y: -35, angle: 0 };
      // position 0..=1000 should be translated into angle -90°..=90°
      // 0..=1000 -> -500..=500 -> -1/2..=1/2 -> PI/2..=PI/2
      pivot.angle += ((position - 500) / 1000) * Math.PI;
      const { x, y } = transform(pivot, { x: 30, y: 0, angle: 0 });

      // eslint-disable-next-line no-param-reassign
      control.pointA = { x, y };
    };

    if (leftPosition !== null)
      applyTransform(this.leftGrabberControl, leftPosition);
  }

  setPose({ x, y, angle }: Pose) {
    Matter.Body.setPosition(this.body, { x, y });
    Matter.Body.setAngle(this.body, angle);
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

    this.applyForce(lPos, this.motors[0] / 10, cos, sin);
    this.applyForce(rPos, this.motors[1] / 10, cos, sin);
  }

  handleSurfaceSensor(
    eventName: 'collisionStart' | 'collisionEnd',
    sensor: Matter.Body,
  ) {
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

  moveMotor(port: number, power: number) {
    this.motors[port] = power;
  }

  setServo(port: number, position: number | null) {
    this.servos[port] = position;

    if (port === 0 || port === 1) {
      this.setGrabberControls(this.servos[0], this.servos[1]);
    }
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

export class Simulation {
  world: Matter.World;
  engine: Matter.Engine;
  runner: Matter.Runner;

  render: Matter.Render | null;

  // special bodies for simulation logic
  lines: Array<Matter.Body | Matter.Composite> = [];
  robots: Array<Robot> = [];

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

        let other;
        if (this.lines.includes(bodyA)) {
          other = bodyB;
        } else if (this.lines.includes(bodyB)) {
          other = bodyA;
        } else return;

        this.robots.forEach(robot => {
          if (robot.surfaceSensors.includes(other)) {
            robot.handleSurfaceSensor(name, other);
          }
        });
      });
    };

    Matter.Events.on(this.engine, 'collisionStart', collisionHandler);
    Matter.Events.on(this.engine, 'collisionEnd', collisionHandler);
  }

  mount(element: Element, width: number, height: number) {
    this.render = Matter.Render.create({
      element,
      engine: this.engine,
      options: { width, height, wireframes: false, background: '#eeeeee' },
    });
  }

  unmount() {
    // TODO
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
    Matter.Render.lookAt(this.render, bounds);
  }

  add(bodies: Array<Matter.Body | Matter.Composite>) {
    Matter.World.add(this.world, bodies);
  }
}
