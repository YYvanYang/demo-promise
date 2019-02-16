// Features:
// * Turn exceptions in user code into rejections

// MISSING: revealing constructor pattern

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
        let returnValue = new DemoPromise();
        let self = this;

        let fulfilledTask;
        if (typeof onFulfilled === 'function') {
            fulfilledTask = function () {
                try { // [new]
                    let r = onFulfilled(self.promiseResult);
                    returnValue.resolve(r);
                } catch (e) {
                    returnValue.reject(e);
                }
            };
        } else {
            fulfilledTask = function () {
                returnValue.resolve(self.promiseResult);
            };
        }

        let rejectedTask;
        if (typeof onRejected === 'function') {
            rejectedTask = function () {
                try { // [new]
                    let r = onRejected(self.promiseResult);
                    returnValue.resolve(r);
                } catch (e) {
                    returnValue.reject(e);
                }
            };
        } else {
            rejectedTask = function () {
                // `onRejected` has not been provided
                // => we must pass on the rejection
                returnValue.reject(self.promiseResult);
            };
        }

        switch (this.promiseState) {
            case 'pending':
                this.fulfillReactions.push(fulfilledTask);
                this.rejectReactions.push(rejectedTask);
                break;
            case 'fulfilled':
                addToTaskQueue(fulfilledTask);
                break;
            case 'rejected':
                addToTaskQueue(rejectedTask);
                break;
        }
        return returnValue;
    }
    catch(onRejected) {
        return this.then(null, onRejected);
    }
    resolve(value) {
        if (this.alreadyResolved) return;
        this.alreadyResolved = true;
        this._doResolve(value);
        return this; // enable chaining
    }
    _doResolve(value) {
        let self = this;
        if (typeof value === 'object' && value !== null && 'then' in value) {
            // Forward fulfillments and rejections from `value` to `this`.
            // Added as a task (vs. done immediately) to preserve async semantics.
            addToTaskQueue(function () {
                value.then(
                    function onFulfilled(result) {
                        self._doResolve(result);
                    },
                    function onRejected(error) {
                        self._doReject(error);
                    });
            });
        } else {
            this.promiseState = 'fulfilled';
            this.promiseResult = value;
            this._clearAndEnqueueReactions(this.fulfillReactions);
        }
    }

    reject(error) {
        if (this.alreadyResolved) return;
        this.alreadyResolved = true;
        this._doReject(error);
        return this; // enable chaining
    }
    _doReject(error) {
        this.promiseState = 'rejected';
        this.promiseResult = error;
        this._clearAndEnqueueReactions(this.rejectReactions);
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