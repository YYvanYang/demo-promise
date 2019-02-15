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
