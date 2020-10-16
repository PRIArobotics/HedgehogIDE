// @flow

import Matter from 'matter-js';

import { Pose, Hedgehog, schema } from '.';
import { DifferentialDrive } from './drives';
import { CollisionSensor, TouchSensor, LineSensor, DistanceSensor } from './sensors';
import { ServoArm } from './servo';

function createArray<T>(length: number, cb: (index: number) => T): T[] {
  // Array.from({ length: n }, (v, i) => ...):
  // first parameter is array-like, so `length` is an array length
  // all values (`v`) are `undefined`, map them to something else.

  return Array.from({ length }, (_elem, index) => cb(index));
}

/**
 * A simulated robot, capable of moving through and sensing the simulation.
 */
export default class Robot {
  controller = new Hedgehog();

  body: Matter.Body;
  collisionSensors: CollisionSensor[];
  drive: DifferentialDrive;
  servoArms: ServoArm[];

  robot: Matter.Composite;

  constructor(options: schema.RobotProps) {
    this.initBody(options);
  }

  initBody({
    render: renderBody,
  }: schema.RobotProps) {
    const material = {
      density: 1,
      frictionAir: 0.4,
    };
    const materialGrabber = {
      density: 0.02,
      frictionAir: 0,
    };
    const styleWheel = {
      render: {
        fillStyle: '#777777',
      },
    };
    const styleBody = {
      render: {
        fillStyle: '#38b449',
        ...renderBody,
      },
    };
    const styleLineSensor = {
      // fillStyle controlled by sensor
    };
    const styleTouchSensor = {
      // fillStyle controlled by sensor
    };
    const styleDistanceSensor = {
      render: {
        fillStyle: '#555555',
      },
    };
    const optionsDistanceSensorSegment = {
      isSensor: true,
      density: 0,
      frictionAir: 0,
      // fillStyle & opacity controlled by sensor
    };
    const styleGrabber = {
      render: {
        fillStyle: '#777777',
      },
    };

    const leftWheel = Matter.Bodies.rectangle(7, -21, 20, 4, {
      ...material,
      ...styleWheel,
      label: 'leftWheel',
    });
    const rightWheel = Matter.Bodies.rectangle(7, 21, 20, 4, {
      ...material,
      ...styleWheel,
      label: 'rightWheel',
    });
    const mainBody = Matter.Bodies.rectangle(0, 0, 40, 32, {
      ...material,
      ...styleBody,
      label: 'mainBody',
    });
    const lineSensors = [
      Matter.Bodies.circle(22, -22, 2, {
        ...material,
        ...styleLineSensor,
        label: 'leftLineSensor',
      }),
      Matter.Bodies.circle(22, -8, 2, {
        ...material,
        ...styleLineSensor,
        label: 'centerLeftLineSensor',
      }),
      Matter.Bodies.circle(22, 8, 2, {
        ...material,
        ...styleLineSensor,
        label: 'centerRightLineSensor',
      }),
      Matter.Bodies.circle(22, 22, 2, {
        ...material,
        ...styleLineSensor,
        label: 'rightLineSensor',
      }),
    ];
    const touchSensors = [
      Matter.Bodies.rectangle(24, 0, 3, 32, {
        ...material,
        ...styleTouchSensor,
        label: 'frontTouchSensor',
      }),
    ];

    function createDistanceSensor(x: number, y: number, angle: number, label: string) {
      const sensorBody = Matter.Bodies.rectangle(x, y, 3, 3, {
        ...material,
        ...styleDistanceSensor,
        angle,
        label,
      });

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const length = 5;
      const numSegments = 60;

      const segments = createArray(numSegments, index => {
        const distance = length / 2 + length * index;
        const body = Matter.Bodies.rectangle(x + cos * distance, y + sin * distance, length, 2, {
          ...optionsDistanceSensorSegment,
          angle,
          label: `${label}-${index}`,
        });

        return [
          body,
          // add another half length to get to the outer edge of the segment
          length * (index + 1),
        ];
      });

      return {
        sensorBody,
        segments,
      };
    }

    const deg = Math.PI / 180;
    const distanceSensors = [
      createDistanceSensor(20, -14, -60 * deg, 'leftDistanceSensor'),
      createDistanceSensor(20, 0, 0, 'centerDistanceSensor'),
      createDistanceSensor(20, 14, 60 * deg, 'rightDistanceSensor'),
    ];
    this.body = Matter.Body.create({
      parts: [
        leftWheel,
        rightWheel,
        ...lineSensors,
        ...touchSensors,
        ...distanceSensors.flatMap(({ sensorBody, segments }) => [
          sensorBody,
          ...segments.map(([body, _distance]) => body),
        ]),
        mainBody,
      ],
      ...material,
      label: 'body',
    });

    this.drive = new DifferentialDrive(this.controller, 0, 1, leftWheel, rightWheel, this.body);
    this.collisionSensors = [
      ...lineSensors.map((sensor, index) => new LineSensor(this.controller, sensor, 0 + index)),
      ...touchSensors.map((sensor, index) => new TouchSensor(this.controller, sensor, 8 + index)),
      ...distanceSensors.flatMap(({ segments }, index) => {
        const sensor = new DistanceSensor(this.controller, 4 + index, segments);
        return sensor.segments;
      }),
    ];

    // // pivot pose in body coords
    // const pivotAnchorLeft = { x: 27, y: -19, angle: 0 };
    // const pivotAnchorRight = { x: 27, y: 19, angle: 0 };
    // // pivot pose in arm coords
    // const pivotArm = { x: -17, y: 0, angle: 0 };

    // const leftGrabber = Matter.Bodies.rectangle(35, -15, 35, 3, {
    //   ...materialGrabber,
    //   ...styleGrabber,
    // });
    // const rightGrabber = Matter.Bodies.rectangle(35, 15, 35, 3, {
    //   ...materialGrabber,
    //   ...styleGrabber,
    // });

    this.servoArms = [
      // new ServoArm(this.controller, 0, mainBody, pivotAnchorLeft, leftGrabber, pivotArm, 30),
      // new ServoArm(this.controller, 1, mainBody, pivotAnchorRight, rightGrabber, pivotArm, 30),
    ];

    this.robot = Matter.Composite.create({
      bodies: [this.body],
      // parts: [this.body, leftGrabber, rightGrabber],
      constraints: [...this.servoArms.flatMap(arm => [arm.pivotConstraint, arm.controlConstraint])],
      label: 'bot',
    });
  }

  setPose({ x, y, angle }: Pose) {
    Matter.Body.setPosition(this.body, { x, y });
    Matter.Body.setAngle(this.body, angle);
  }

  beforeUpdate() {
    this.drive.beforeUpdate();
    for (const servoArm of this.servoArms) {
      servoArm.beforeUpdate();
    }
  }
}
