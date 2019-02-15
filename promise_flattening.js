// Features:
// * resolve() “flattens” parameter `value` if it is a promise
//   (the state of`this` becomes locked in on `value`)

export class DemoPromise {
  constructor() {
    this.fulfillReactions = [];
    this.rejectReactions = [];
    this.promiseResult = undefined;
    this.promiseState = 'pending';
    // Settled or locked-in?
    this.alreadyResolved = false;
  }
  then(onFulfilled, onRejected) {
    const returnValue = new DemoPromise();
    const self = this;

    let fulfilledTask;
    if (typeof onFulfilled === 'function') {
      fulfilledTask = function() {
        const r = onFulfilled(self.promiseResult);
        returnValue.resolve(r);
      };
    } else {
      fulfilledTask = function() {
        returnValue.resolve(self.promiseResult);
      };
    }

    let rejectedTask;
    if (typeof onRejected === 'function') {
      rejectedTask = function() {
        const r = onRejected(self.promiseResult);
        returnValue.resolve(r);
      };
    } else {
      rejectedTask = function() {
        // `onRejected` has not been provided
        // => we must pass on the rejection
        returnValue.reject(self.promiseResult);
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

    return returnValue;
  }

  resolve(value) {
    if (this.alreadyResolved) return;
    this.alreadyResolved = true;
    this._doResolve(value);
    return this;
  }
  reject(error) {
    if (this.alreadyResolved) return;
    this.alreadyResolved = true;
    this._doReject(error);
    return this; // enable chaining
  }
  _clearAndEnqueueReactions(reactions) {
    this.fulfillReactions = undefined;
    this.rejectReactions = undefined;
    reactions.map(addToTaskQueue);
  }
  _doResolve(value) {
    const self = this;
    // Is `value` a thenable?
    if (typeof value === 'object' && value !== null && 'then' in value) {
      // Forward fulfillments and rejections from `value` to `this`.
      // Added as a task (versus done immediately) to preserve async semantics.
      addToTaskQueue(function() {
        // (A)
        value.then(
          function onFulfilled(result) {
            self._doResolve(result);
          },
          function onRejected(error) {
            self._doReject(error);
          }
        );
      });
    } else {
      this.promiseState = 'fulfilled';
      this.promiseResult = value;
      this._clearAndEnqueueReactions(this.fulfillReactions);
    }
  }
  _doReject(error) {
    // [new]
    this.promiseState = 'rejected';
    this.promiseResult = error;
    this._clearAndEnqueueReactions(this.rejectReactions);
  }
}

function addToTaskQueue(task) {
  setTimeout(task, 0);
}

// The flattening is performed in line A: If value is fulfilled, we want self to be fulfilled and if value is rejected, we want self to be rejected. The forwarding happens via the private methods _doResolve and _doReject, to get around the protection via alreadyResolved.
