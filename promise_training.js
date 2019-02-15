// Features:
// * then() returns a promise, which fulfills with what
//   either onFulfilled or onRejected return
// * Missing onFulfilled and onRejected pass on what they receive

export class DemoPromise {
  constructor() {
    this.fulfillReactions = [];
    this.rejectReactions = [];
    this.promiseResult = undefined;
    this.promiseState = 'pending';
  }
  then(onFulfilled, onRejected) {
    // then() creates and returns a new Promise (lines A and F). Additionally, fulfilledTask and rejectedTask are set up differently: After a settlement…
    // - The result of onFulfilled is used to resolve returnValue (line B).
    //   > If onFulfilled is missing, we use the fulfillment value to resolve returnValue (line C).
    // - The result of onRejected is used to resolve (not reject!) returnValue (line D).
    //   > If onRejected is missing, we use pass on the rejection value to returnValue (line E).
    const returnValue = new DemoPromise(); // (A)
    const self = this;

    let fulfilledTask;
    if (typeof onFulfilled === 'function') {
      fulfilledTask = function() {
        const r = onFulfilled(self.promiseResult);
        returnValue.resolve(r); // (B)
      };
    } else {
      fulfilledTask = function() {
        returnValue.resolve(self.promiseResult); // (C)
      };
    }

    let rejectedTask;
    if (typeof onRejected === 'function') {
      rejectedTask = function() {
        const r = onRejected(self.promiseResult);
        returnValue.resolve(r); // D
      };
    } else {
      rejectedTask = function() {
        // `onRejected` has not been provided
        // => we must pass on the rejection
        returnValue.reject(self.promiseResult); // (E)
      };
    }

    switch (this.promiseState) {
      case 'pending':
        // If the Promise is still pending,
        // it queues invocations of onFulfilled and onRejected,
        // to be used when the Promise is settled.
        this.fulfillReactions.push(fulfilledTask);
        this.rejectReactions.push(rejectedTask);
        break;
      // If the Promise is already fulfilled or rejected,
      // onFulfilled or onRejected can be invoked right away.
      case 'fulfilled':
        addToTaskQueue(fulfilledTask);
        break;
      case 'rejected':
        addToTaskQueue(rejectedTask);
        break;
      default:
        break;
    }

    return returnValue; // (F)
  }

  resolve(value) {
    if (this.promiseState !== 'pending') return;
    this.promiseState = 'fulfilled';
    this.promiseResult = value;
    this._clearAndEnqueueReactions(this.fulfillReactions);
    return this; // enable chaining
  }
  reject(error) {
    if (this.promiseState !== 'pending') return;
    this.promiseState = 'rejected';
    this.promiseResult = error;
    this._clearAndEnqueueReactions(this.rejectReactions);
    return this;
  }
  _clearAndEnqueueReactions(reactions) {
    this.fulfillReactions = undefined;
    this.rejectReactions = undefined;
    reactions.map(addToTaskQueue);
  }
}

function addToTaskQueue(task) {
  setTimeout(task, 0);
}
