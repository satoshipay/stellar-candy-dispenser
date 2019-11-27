const ws281x = require("rpi-ws281x-v2");

const colorize = (r, g, b) => (r << 16) | (g << 8) | b;
const fraction = (value) => value - Math.floor(value);

function fill(array, value) {
  for (let index = 0; index < array.length; index++) {
    array[index] = value
  }
}

module.exports.createLEDController = function createLEDController() {
  ws281x.configure({
    brightness: 128,
    gpio: 12,
    leds: 12,
    rgb: "grb"
  });

  let stopCurrentAnimation = () => undefined;
  const pixels = new Uint32Array(12);

  const controller = {
    setAll(color) {
      stopCurrentAnimation();
      fill(pixels, color);
      ws281x.render(pixels);
    },
    pulse(color, pulseDuration, min = 0, max = 1) {
      stopCurrentAnimation();
      const startTime = Date.now();

      const r = (color >> 16) & 0xFF;
      const g = (color >> 8) & 0xFF;
      const b = color & 0xFF;

      const interval = setInterval(() => {
        const currentValue = Math.abs(fraction((Date.now() - startTime) / pulseDuration) * 2 - 1);
        const l = min + Math.max(Math.min(currentValue, max), min) * Math.abs(max - min);
        const currentColor = colorize(Math.floor(r * l), Math.floor(g * l), Math.floor(b * l));

        for (let index = 0; index < pixels.length; index++) {
          pixels[index] = currentColor;
        }
        ws281x.render(pixels);
      }, 50);

      const stop = () => clearInterval(interval);
      stopCurrentAnimation = stop;

      return stop;
    },
    spin(color, rotationDuration) {
      stopCurrentAnimation();
      let counter = 0;

      const interval = setInterval(() => {
        counter = (counter - 1) % 12;
        for (let index = 0; index < pixels.length; index++) {
          pixels[index] = (index + counter) % 6 === 0 ? 0 : color;
        }
        ws281x.render(pixels);
      }, rotationDuration / 12);

      const stop = () => clearInterval(interval);
      stopCurrentAnimation = stop;

      return stop;
    },
    off() {
      stopCurrentAnimation();
      fill(pixels, 0);
      ws281x.render(pixels);
    }
  }

  process.on("exit", () => controller.off());
  process.on("SIGINT", () => controller.off());
  process.on("SIGTERM", () => controller.off());

  return controller
}

module.exports.color = colorize
