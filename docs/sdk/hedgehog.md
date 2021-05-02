# Hedgehog SDK
Allows interaction with Hedgehog robots within the simulation environment.

## Functions
#### `async sdk.hedgehog.commands(robot: string, cmds: Command[])`
Sends multiple hedgehog commands (one of `moveMotor`, `setServo`, `getAnalog` or `getDigital`) at once.

#### `async sdk.hedgehog.moveMotor(robot: string, port: number, power: number)`
Sets the robot's velocity in per mille (-1000 to 1000). If set to 0, the motor will be stopped.

#### `async sdk.hedgehog.setServo(robot: string, port: number, position: number)`
Sets the servo position.

#### `async sdk.hedgehog.getAnalog(robot: string, port: number)`
Returns the value of the analog sensor at the specified port.

#### `async sdk.hedgehog.getDigital(robot: string, port: number)`
Returns the value of the digital sensor at the specified port.

#### `async sdk.hedgehog.sleep(millis: number)`
Returns after the amount of time is elapsed *in the simulation*. Note that this may take longer than "real" milliseconds of the simulation is lagging.

## Events
This module does not have any events.
