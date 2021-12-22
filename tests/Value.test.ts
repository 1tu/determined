import { expect } from 'chai';
import * as sinon from 'sinon';
import { Value } from '../src/inner/Value';

afterEach(() => {
  // console.log(11);
});

describe('Value', () => {
  it('Чтение', () => {
    const v = new Value(1);

    expect(v.get()).to.eq(1);
  })

  it('Запись', () => {
    const v = new Value(1);
    v.set(2);

    expect(v.get()).to.eq(2);
  })
})