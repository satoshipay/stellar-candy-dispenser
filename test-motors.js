const config = require("./src/config");
const servo = require("./src/servo");

const motor1 = servo(18, config.motorConfigLeft);
const motor2 = servo(23, config.motorConfigRight);

if (process.env.MOTOR === "1") {
  motor1.executeTurn();
} else {
  motor2.executeTurn();
}
