require("dotenv").config();

const production = process.env.NODE_ENV === "production";

const accountID1 = production
  ? process.env.ACCOUNT_PUBLIC_KEY_1
  : process.env.TEST_PUBLIC_KEY_1;

const accountID2 = production
  ? process.env.ACCOUNT_PUBLIC_KEY_2
  : process.env.TEST_PUBLIC_KEY_2;

const turnSpeedMotor1 = process.env.TURN_SPEED_1
  ? Number.parseFloat(process.env.TURN_SPEED_1)
  : 100;
const turnSpeedMotor2 = process.env.TURN_SPEED_2
  ? Number.parseFloat(process.env.TURN_SPEED_2)
  : 100;

const horizonURL =
  process.env.NODE_ENV === "production"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";

module.exports = {
  accountID1,
  accountID2,
  horizonURL,
  turnSpeedMotor1,
  turnSpeedMotor2
};
