# Hedgehog SDK
Allows interaction with Hedgehog robots within the simulation environment.

## Functions
#### `sdk.hedgehog.commands(robot: string, cmds: Command[])`
Sends multiple hedgehog commands (one of `moveMotor`, `setServo`, `getAnalog` or `getDigital`) at once.

#### `sdk.hedgehog.moveMotor(robot: string, port: number, power: number)`
Sets the robot's velocity in per mille (-1000 to 1000). If set to 0, the motor will be stopped.

#### `sdk.hedgehog.setServo(robot: string, port: number, position: number)`
Sets the servo position.

#### `sdk.hedgehog.getAnalog(robot: string, port: number)`
Returns the value of the analog sensor at the specified port.

#### `sdk.hedgehog.getDigital(robot: string, port: number)`
Returns the value of the digital sensor at the specified port.

## Events
This module does not have any events.



