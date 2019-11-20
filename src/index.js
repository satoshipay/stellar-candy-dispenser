const StellarSdk = require("stellar-sdk");
const { default: PQueue } = require("p-queue");
const servo = require("./servo");

require("dotenv").config();

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const raspberryAccountID = process.env.ACCOUNT_PUBLIC_KEY;

const promiseQueue = new PQueue({ concurrency: 1 });

let latestCursor = "0";
let latestCreatedAt = "";

const motor1 = servo(18);
const motor2 = servo(23);

async function listenForTransactions(accountID) {
  server
    .transactions()
    .forAccount(accountID)
    .cursor("now")
    .stream({
      onmessage: function(transaction) {
        latestCursor = transaction.paging_token;
        latestCreatedAt = transaction.created_at;
        promiseQueue.add(() => handleTransaction(transaction));
      }
    });
}

async function handleTransaction(transaction) {
  // TODO check memos and values (e.g. 1XLM received and memo contains info)

  console.log("Handling transaction", transaction.id);
  await motor1.executeTurn();
}

async function startPolling() {
  // TODO poll for new transactions
}

function init() {
  listenForTransactions(raspberryAccountID);

  setInterval(() => {
    startPolling();
  }, 5000);
}

init();
