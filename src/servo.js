// source: https://github.com/fivdi/pigpio#servo-control

const Gpio = require("pigpio").Gpio;
const { sleep } = require("./utils")

module.exports = function(gpioNumber, { speed, duration, alternations }) {
  const motor = new Gpio(gpioNumber, { mode: Gpio.OUTPUT });

  const basePulseWidth = 500 + (2500 - 500) / 2;
  const rightTorque = Math.round(basePulseWidth + speed + speed / 2);
  const leftTorque = basePulseWidth - speed;

  function turnRight() {
    motor.servoWrite(rightTorque);
  }

  function turnLeft() {
    motor.servoWrite(leftTorque);
  }

  async function executeTurn() {
    return new Promise(async resolve => {
      motor.servoWrite(basePulseWidth);

      const durationPerAlternation = duration / alternations;

      for (let i = 0; i < alternations; i++) {
        if (i % 2 === 0) {
          turnRight();
        } else {
          turnLeft();
        }
        await sleep(durationPerAlternation);
      }

      motor.servoWrite(0)
      resolve()
    });
  }

  return {
    executeTurn
  };
};
