const StellarSdk = require("stellar-sdk");
const servo = require("./servo");
const dispenser = require("./dispenser");

require("dotenv").config();

const accountID1 = process.env.ACCOUNT_PUBLIC_KEY_1;
const accountID2 = process.env.ACCOUNT_PUBLIC_KEY_2;

const horizonURL =
  process.env.NODE_ENV === "production"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Server(horizonURL);


const motorLeft = servo(
  18,
  process.env.TURN_SPEED_1 ? Number(process.env.TURN_SPEED_1) : 100
);

const motorRight = servo(
  23,
  process.env.TURN_SPEED_2 ? Number(process.env.TURN_SPEED_2) : 100
);

dispenser(motorLeft, accountID1, server);
dispenser(motorRight, accountID2, server);
