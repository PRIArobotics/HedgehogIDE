// @flow

import Matter from 'matter-js';

import { Pose, Hedgehog } from '.';
import { DifferentialDrive } from './drives';
import { CollisionSensor, TouchSensor, LineSensor, DistanceSensor } from './sensors';

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

  // leftGrabberControl: Matter.Constraint;
  // rightGrabberControl: Matter.Constraint;
  body: Matter.Body;
  collisionSensors: CollisionSensor[];
  drive: DifferentialDrive;

  bodies: Matter.Body[];

  constructor() {
    this.initBody();
  }

  initBody() {
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
    // const styleGrabber = {
    //   render: {
    //     fillStyle: '#777777',
    //   },
    // };

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

    this.drive = new DifferentialDrive(this.controller, 0, 1, leftWheel, rightWheel, this.body);
    this.collisionSensors = [
      ...lineSensors.map((sensor, index) => new LineSensor(this.controller, sensor, 0 + index)),
      ...touchSensors.map((sensor, index) => new TouchSensor(this.controller, sensor, 8 + index)),
      ...distanceSensors.flatMap(({ segments }, index) => {
        const sensor = new DistanceSensor(this.controller, 4 + index, segments);
        return sensor.segments;
      }),
    ];
    this.bodies = [bot, ...bot.parts];
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
    this.body.plugin.hedgehog = {
      initialPose: pose,
    };
  }

  beforeUpdate() {
    this.drive.beforeUpdate();
  }
}
