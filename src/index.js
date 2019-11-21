const StellarSdk = require("stellar-sdk");
const servo = require("./servo");
const config = require("./config");
const dispenser = require("./dispenser");

const server = new StellarSdk.Server(config.horizonURL);

const motorLeft = servo(18, config.turnSpeedMotor1);
const motorRight = servo(23, config.turnSpeedMotor2);

dispenser(motorLeft, config.accountID1, server);
dispenser(motorRight, config.accountID2, server);
