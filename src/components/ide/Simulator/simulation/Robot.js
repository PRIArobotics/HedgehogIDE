// @flow

import Matter from 'matter-js';

import { Point, Pose, Hedgehog } from '.';
import { DifferentialDrive } from './drives';
import { CollisionSensor, TouchSensor, LineSensor } from './sensors';

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
    const body = Matter.Bodies.rectangle(0, 0, 40, 32, {
      ...material,
      ...styleBody,
      label: 'bodyPart',
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
    this.body = Matter.Body.create({
      parts: [leftWheel, rightWheel, ...lineSensors, ...touchSensors, body],
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

    this.drive = new DifferentialDrive(this.controller, leftWheel, rightWheel, this.body);
    this.collisionSensors = [
      ...lineSensors.map(
        (sensor, index) => new LineSensor(this.controller, sensor, 0 + index),
      ),
      ...touchSensors.map(
        (sensor, index) => new TouchSensor(this.controller, sensor, 8 + index),
      ),
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
