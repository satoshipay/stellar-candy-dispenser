const { default: PQueue } = require("p-queue");

const promiseQueue = new PQueue({ concurrency: 1 });

let latestCursor = "0";
let latestCreatedAt = "";

module.exports = async function init(motor, accountID, server) {
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
        onmessage: function(transaction) {
          console.log("Received transaction via stream:", transaction.id)

          if (
            Date.parse(latestCreatedAt) < Date.parse(transaction.created_at)
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
          Number(operation.amount) >= 1
        ) {
          containsValidPaymentOperation = true;
        }
      }

      if (containsValidPaymentOperation) {
        await motor.executeTurn();
      } else {
        console.log(
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
    const { records } = await server
      .transactions()
      .forAccount(accountID)
      .cursor(latestCursor)
      .order("asc")
      .call();

    console.log("Polled transactions:", records.map(record => record.id));

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
      .forAccount(accountID)
      .limit(1)
      .order("desc")
      .call();

    if (records.length > 0) {
      const latestTransaction = records[0];
      latestCursor = latestTransaction.paging_token;
      latestCreatedAt = latestTransaction.created_at;

      console.log(
        "Set latestTransaction info to",
        latestCursor,
        latestCreatedAt
      );
    }
  }
};
