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
    this.bodies = [this.body];
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
