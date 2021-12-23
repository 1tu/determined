import { expect } from 'chai';
import * as sinon from 'sinon';
import { Computed } from '../../src';
import { Value } from '../../src/inner/Value';

describe('Значение', () => {
  it('Чтение', () => {
    const v = new Value(1);
    expect(v.get()).to.eq(1);
  })

  it('Запись', () => {
    const v = new Value(1);
    v.set(2);
    expect(v.get()).to.eq(2);
  })

  it('Чтение. одна и та-же зависимость дважды', () => {
    const listenerC1 = sinon.spy();

    const v = new Value(1);
    const c0 = new Computed(() => v.get() + 1, { onChange: listenerC1 });
    const c1 = new Computed(() => c0.get() + c0.get());
    c1.get();
    expect(listenerC1.callCount).to.eq(1);
    expect(c1.get()).to.eq(4);
  })
})