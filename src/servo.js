// source: https://github.com/fivdi/pigpio#servo-control

const Gpio = require("pigpio").Gpio;

module.exports = function(gpioNumber) {
  const motor = new Gpio(gpioNumber, { mode: Gpio.OUTPUT });

  const basePulseWidth = 500 + (2500 - 500) / 2;
  const rightTorque = basePulseWidth + 150;
  const leftTorque = basePulseWidth - 100;

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
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        motor.servoWrite(0);
        resolve();
      }, 5000);
    });
  }

  return {
    executeTurn
  };
};
