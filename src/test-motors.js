const servo = require("./servo");

const motor1 = servo(
  18,
  process.env.TURN_SPEED_1 ? Number(process.env.TURN_SPEED_1) : 100
);

const motor2 = servo(
  23,
  process.env.TURN_SPEED_2 ? Number(process.env.TURN_SPEED_2) : 100
);

if (process.env.MOTOR === "1") {
  motor1.executeTurn();
} else {
  motor2.executeTurn();
}
