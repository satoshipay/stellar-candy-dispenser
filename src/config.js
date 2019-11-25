require("dotenv").config();

const ms = require("ms");

const production = process.env.NODE_ENV === "production";

const accountID1 = production
  ? process.env.ACCOUNT_PUBLIC_KEY_1
  : process.env.TEST_PUBLIC_KEY_1;

const accountID2 = production
  ? process.env.ACCOUNT_PUBLIC_KEY_2
  : process.env.TEST_PUBLIC_KEY_2;

const motorConfigLeft = parseMotorConfig(process.env.MOTOR_CONFIG_LEFT || "");
const motorConfigRight = parseMotorConfig(process.env.MOTOR_CONFIG_RIGHT || "");

const priceLeft = Number.parseFloat(process.env.PRICE_LEFT)
const priceRight = Number.parseFloat(process.env.PRICE_RIGHT)

const horizonURL =
  process.env.NODE_ENV === "production"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";

module.exports = {
  accountID1,
  accountID2,
  horizonURL,
  motorConfigLeft,
  motorConfigRight,
  priceLeft,
  priceRight
};

function parseMotorConfig(config) {
  const [speed = "100", duration = "5s", alternations = "5"] = config.split(
    ":"
  );
  return {
    speed: Number.parseInt(speed, 10),
    duration: ms(duration),
    alternations: Number.parseInt(alternations, 10)
  };
}
