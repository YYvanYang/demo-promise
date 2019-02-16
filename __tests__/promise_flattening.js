import { DemoPromise } from '../promise_flattening';
describe('Fulfilling by returning in reactions', function () {
  it('fulfills via onFulfilled', function (done) {
      let dp = new DemoPromise();
      dp.resolve();
      dp
      .then(function (value1) {
          expect(value1).toBe(undefined);
          return 123;
      })
      .then(function (value2) {
          expect(value2).toBe(123);
          done();
      });
  });
});

describe('Chaining', function () {
    it('chains with a non-thenable', function (done) {
        let dp = new DemoPromise();
        dp.resolve('a');
        dp
        .then(function (value1) {
            expect(value1).toBe('a');
            return 'b';
        })
        .then(function (value2) {
            expect(value2).toBe('b');
            done();
        });
    });

    it('chains with a promise', function (done) {
        let dp1 = new DemoPromise();
        let dp2 = new DemoPromise();
        dp1.resolve(dp2);
        dp2.resolve(123);
        // Has the value been passed on to dp1?
        dp1.then(function (value) {
            expect(value).toBe(123);
            done();
        });
    });
  });
