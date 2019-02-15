// Features:
// * then() must work independently if the promise is
//   settled either before or after it is called
// * You can only resolve or reject once

export class DemoPromise {
  constructor() {
    this.fulfillReactions = [];
    this.rejectReactions = [];
    this.promiseResult = undefined;
    this.promiseState = 'pending';
  }
  then(onFulfilled, onRejected) {
    const self = this;
    const fulfilledTask = function() {
      onFulfilled(self.promiseResult);
    };
    const rejectedTask = function() {
      onRejected(self.promiseResult);
    };
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
