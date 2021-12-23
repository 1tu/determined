import { expect } from 'chai';
import * as sinon from 'sinon';
import { Computed, Observable, Observer } from '../../src';

describe('Граф. Подписка', () => {
  it('Простой цепочкой', () => {
    const listenerObs = sinon.spy();

    const v1 = new Observable(5);
    const c1 = new Computed(() => v1.get() * 4);
    const obs = new Observer(() => c1.get(), listenerObs);
    expect(listenerObs.callCount).to.be.eq(1);
  })

  it('Средней цепочкой', () => {
    const listenerC0 = sinon.spy();
    const listenerC1 = sinon.spy();
    const listenerObs = sinon.spy();

    const v1 = new Observable(5);
    const c0 = new Computed(() => v1.get() + 2, { onChange: listenerC0 });
    const c1 = new Computed(() => c0.get() + c0.get(), { onChange: listenerC1 });
    const obs = new Observer(() => c1.get(), listenerObs);
    v1.set(2);
    expect(listenerC0.callCount).to.be.eq(2);
    expect(listenerC1.callCount).to.be.eq(2);
    expect(listenerObs.callCount).to.be.eq(2);
  })
})