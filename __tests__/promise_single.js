import { DemoPromise } from '../promise_single';
describe('Order of resolving', function () {
  it('resolves before then()', function (done) {
      let dp = new DemoPromise();
      dp.resolve('abc');
      dp.then(function (value) {
          expect(value).toBe('abc');
          done();
      });
  });
  it('resolves after then()', function (done) {
      let dp = new DemoPromise();
      dp.then(function (value) {
          expect(value).toBe('abc');
          done();
      });
      dp.resolve('abc');
  });
});