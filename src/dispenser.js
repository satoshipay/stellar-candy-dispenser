const { default: PQueue } = require("p-queue");
const { color, createLEDController } = require("./leds");
const { sleep } = require("./utils");

const leds = createLEDController();
const promiseQueue = new PQueue({ concurrency: 1 });

const brandColor = color(0, 88, 205);
const polledTransactionsCap = 3

const showIdlePulse = () => leds.pulse(brandColor, 5000, 0.3, 1);
const showSpinner = () => leds.spin(brandColor, 1500);

showIdlePulse();
promiseQueue.on("active", () => showSpinner());

module.exports = async function init(motor, accountID, server, price) {
  let latestCursor = "0";
  let latestCreatedAt = "0";

  await initialFetch();

  listenForTransactions(latestCursor);

  setInterval(() => {
    pollTransactions();
  }, 10000);

  async function listenForTransactions(initialCursor) {
    server
      .transactions()
      .forAccount(accountID)
      .cursor(initialCursor)
      .stream({
        onmessage (transaction) {
          console.log("Received transaction via stream:", transaction.id)

          if (
            Date.parse(transaction.created_at) > Date.parse(latestCreatedAt) &&
            Date.parse(transaction.created_at) > Date.now() - 30000
          ) {
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
          operation.to === accountID &&
          operation.type === "payment" &&
          Number.parseFloat(operation.amount) >= price
        ) {
          containsValidPaymentOperation = true;
        }
      }

      if (containsValidPaymentOperation) {
        console.log("Valid transaction. Dispensing...");
        await motor.executeTurn();
        leds.setAll(color(128, 128, 0));
        await sleep(5000);
        showIdlePulse();
      } else {
        console.warn(
          `Transaction ${transaction.id} does not contain a valid payment operation`
        );
      }
    } catch (error) {
      console.error(
        `Something went wrong while handling transaction ${transaction.id}:`,
        error
      );
    }
  }

  async function pollTransactions() {
    let { records } = await server
      .transactions()
      .forAccount(accountID)
      .cursor(latestCursor)
      .order("asc")
      .call();

    console.log(
      `Polled transactions since cursor ${latestCursor}:`,
      records.map(record => record.id)
    );

    if (records.length > polledTransactionsCap) {
      console.log(`Polled ${records.length} transactions. Trimming down to 3.`)
      records = records.slice(-polledTransactionsCap)
    }

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
      const latestTransaction = records[records.length - 1];
      latestCursor = latestTransaction.paging_token;
      latestCreatedAt = latestTransaction.created_at;
    }
  }

  async function initialFetch() {
    // fetch latest transaction to get cursor + created_at
    const { records } = await server
      .transactions()
      .forAccount(accountID)
      .limit(1)
      .order("desc")
      .call();

    if (records.length > 0) {
      const latestTransaction = records[0];
      latestCursor = latestTransaction.paging_token;
      latestCreatedAt = latestTransaction.created_at;

      console.log(
        `Set latestTransaction info for account ${accountID} to`,
        latestCursor,
        latestCreatedAt
      );
    }
  }
};
