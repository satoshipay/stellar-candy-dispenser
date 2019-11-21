const StellarSdk = require("stellar-sdk");
const { default: PQueue } = require("p-queue");
const servo = require("./servo");

require("dotenv").config();

const raspberryAccountID = process.env.ACCOUNT_PUBLIC_KEY;

const horizonURL =
  process.env.NODE_ENV === "production"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Server(horizonURL);

const promiseQueue = new PQueue({ concurrency: 1 });

let latestCursor = "0";
let latestCreatedAt = "";

const motorRight = servo(18);
const motorLeft = servo(23);

async function listenForTransactions() {
  server
    .transactions()
    .forAccount(raspberryAccountID)
    .cursor("now")
    .stream({
      onmessage: function(transaction) {
        if (Date.parse(latestCreatedAt) < Date.parse(transaction.created_at)) {
          latestCursor = transaction.paging_token;
          latestCreatedAt = transaction.created_at;
          promiseQueue.add(() => handleTransaction(transaction));
        } else {
          console.log("Discarding transaction, already handled");
        }
      }
    });
}

async function handleTransaction(transaction) {
  console.log("Handling transaction", transaction.id);

  try {
    let containsValidPaymentOperation = false;
    const operations = await transaction.operations();
    for (const operation of operations.records) {
      if (
        operation.to === raspberryAccountID &&
        operation.type === "payment" &&
        Number(operation.amount) >= 1
      ) {
        containsValidPaymentOperation = true;
      }
    }

    if (!containsValidPaymentOperation) {
      console.log(
        `Transaction ${transaction.id} does not contain a valid payment operation`
      );
      return;
    }

    if (transaction.memo && transaction.memo.toLowerCase().startsWith("left")) {
      await motorLeft.executeTurn();
    } else {
      await motorRight.executeTurn();
    }
  } catch (error) {
    console.error(
      `Something went wrong while handling transaction ${transaction.id}:`,
      error
    );
  }
}

async function startPolling() {
  const { records } = await server
    .transactions()
    .forAccount(raspberryAccountID)
    .cursor(latestCursor)
    .order("asc")
    .call();

  console.log("Polled amount of transactions", records.length);

  records.forEach(transaction => {
    if (Date.parse(latestCreatedAt) < Date.parse(transaction.created_at)) {
      latestCursor = transaction.paging_token;
      latestCreatedAt = transaction.created_at;
      promiseQueue.add(() => handleTransaction(transaction));
    } else {
      console.log("Discarding transaction, already handled");
    }
  });

  if (records.length > 0) {
    const latestTransaction = records[0];
    latestCursor = latestTransaction.paging_token;
    latestCreatedAt = latestTransaction.created_at;
  }
}

async function initialFetch() {
  // fetch latest transaction to get cursor + created_at
  const { records } = await server
    .transactions()
    .forAccount(raspberryAccountID)
    .limit(1)
    .order("desc")
    .call();

  if (records.length > 0) {
    const latestTransaction = records[0];
    latestCursor = latestTransaction.paging_token;
    latestCreatedAt = latestTransaction.created_at;

    console.log("Set latestTransaction info to", latestCursor, latestCreatedAt);
  }
}

async function init() {
  listenForTransactions(raspberryAccountID);

  await initialFetch();

  setInterval(() => {
    startPolling();
  }, 5000);
}

init();
