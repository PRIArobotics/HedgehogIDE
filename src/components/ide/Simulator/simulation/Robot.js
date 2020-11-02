// @flow

import Matter from 'matter-js';

import { Pose, Hedgehog, schema } from '.';
import { resolveSprite, setInitialPose } from './schema/helpers';
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

  constructor(config: schema.RobotConfig, assets: Map<string, [string, Uint8Array]> | null = null) {
    this.jsonInit(config, assets);
  }

  jsonInit(
    { position: { x, y }, angle, parts, render: renderBody }: schema.RobotConfig,
    assets: Map<string, [string, Uint8Array]> | null = null,
  ) {
    resolveSprite(renderBody?.sprite, assets);

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

    this.collisionSensors = [];
    const partBodies = [];

    for (const part of parts) {
      try {
        switch (part.type) {
          case 'line': {
            const { type: _type, port, objects } = part;

            if (objects.length !== 1) {
              throw new Error(`robot part must have exactly one object: ${part.type} ${port}`);
            }

            const [object] = objects;
            const partBody = schema.createBody(
              {
                ...material,
                ...styleLineSensor,
                ...object,
              },
              assets,
            );
            const sensor = new LineSensor(this.controller, partBody, port);

            partBodies.push(partBody);
            this.collisionSensors.push(sensor);

            break;
          }
          case 'touch': {
            const { type: _type, port, objects } = part;

            if (objects.length !== 1) {
              throw new Error(`robot part must have exactly one object: ${part.type} ${port}`);
            }

            const [object] = objects;
            const partBody = schema.createBody(
              {
                ...material,
                ...styleTouchSensor,
                ...object,
              },
              assets,
            );
            const sensor = new TouchSensor(this.controller, partBody, port);

            partBodies.push(partBody);
            this.collisionSensors.push(sensor);

            break;
          }
          case 'distance': {
            const { type: _type, port, objects } = part;

            if (objects.length !== 1) {
              throw new Error(`robot part must have exactly one object: ${part.type} ${port}`);
            }

            const [object] = objects;
            const partBody = schema.createBody(
              {
                ...material,
                ...styleDistanceSensor,
                ...object,
              },
              assets,
            );

            const {
              position: { x, y },
              angle,
              label,
            } = partBody;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const length = 5;
            const numSegments = 60;

            const segments = createArray(numSegments, (index) => {
              const distance = length / 2 + length * index;
              const body = Matter.Bodies.rectangle(
                x + cos * distance,
                y + sin * distance,
                length,
                2,
                {
                  ...optionsDistanceSensorSegment,
                  angle,
                  label: `${label}-${index}`,
                },
              );

              return [
                body,
                // add another half length to get to the outer edge of the segment
                length * (index + 1),
              ];
            });
            const sensor = new DistanceSensor(this.controller, port, segments);

            partBodies.push(partBody, ...segments.map(([body, _distance]) => body));
            this.collisionSensors.push(...sensor.segments);

            break;
          }
          case 'servo_arm': {
            // handled later
            break;
          }
          default:
            console.warn('unknown robot part:', part);
        }
      } catch (err) {
        console.error(err);
      }
    }

    this.body = Matter.Body.create({
      parts: [leftWheel, rightWheel, ...partBodies, mainBody],
      ...material,
      label: 'body',
    });

    this.drive = new DifferentialDrive(this.controller, 0, 1, leftWheel, rightWheel, this.body);

    this.servoArms = [];
    const compositePartBodies = [];
    const compositePartConstraints = [];

    for (const part of parts) {
      try {
        switch (part.type) {
          case 'line':
          case 'touch':
          case 'distance': {
            // handled eariler
            break;
          }
          case 'servo_arm': {
            const { type: _type, port, pivotAnchor, pivotArm, length, objects } = part;

            if (objects.length !== 1) {
              throw new Error(`robot part must have exactly one object: ${part.type} ${port}`);
            }

            const [object] = objects;
            const partBody = schema.createBody(
              {
                ...materialGrabber,
                ...styleGrabber,
                ...object,
              },
              assets,
            );

            const servoArm = new ServoArm(
              this.controller,
              port,
              this.body,
              pivotAnchor,
              partBody,
              pivotArm,
              length,
            );

            compositePartBodies.push(partBody);
            compositePartConstraints.push(servoArm.pivotConstraint, servoArm.controlConstraint);
            this.servoArms.push(servoArm);

            break;
          }
          default:
            console.warn('unknown robot part:', part);
        }
      } catch (err) {
        console.error(err);
      }
    }

    this.robot = Matter.Composite.create({
      bodies: [this.body, ...compositePartBodies],
      constraints: [...compositePartConstraints],
      label: 'bot',
    });

    const pose = { x, y, angle };
    this.setPose(pose);
    setInitialPose(this.body);
    // TODO temporary
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

  reset() {
    for (const servoArm of this.servoArms) {
      servoArm.reset();
    }
  }
}
