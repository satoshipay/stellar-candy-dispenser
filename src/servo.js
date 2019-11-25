// source: https://github.com/fivdi/pigpio#servo-control

const Gpio = require("pigpio").Gpio;

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
    return new Promise(resolve => {
      motor.servoWrite(basePulseWidth);

      const interval = setInterval(() => {
        if (motor.getServoPulseWidth() === rightTorque) {
          turnLeft();
        } else {
          turnRight();
        }
      }, duration / alternations);

      setTimeout(() => {
        clearInterval(interval);
        motor.servoWrite(0);
        resolve();
      }, duration);
    });
  }

  return {
    executeTurn
  };
};
