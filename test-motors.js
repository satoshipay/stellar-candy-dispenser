const config = require("./src/config");
const servo = require("./src/servo");

const motor1 = servo(18, config.turnSpeedMotor1);
const motor2 = servo(23, config.turnSpeedMotor2);

if (process.env.MOTOR === "1") {
  motor1.executeTurn();
} else {
  motor2.executeTurn();
}
