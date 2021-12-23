import { expect } from 'chai';
import * as sinon from 'sinon';
import { Computed, Observable, Observer, transaction } from '../../src';

describe('Транзакции', () => {
  it('Базовый', () => {
    const listenerObs = sinon.spy();

    const v1 = new Observable(5);
    const c1 = new Computed(() => v1.get() * 4);
    const obs = new Observer(() => c1.get(), listenerObs);

    transaction(() => {
      v1.set(10);
      v1.set(11);
      v1.set(12);
      v1.set(13);
    })
    expect(listenerObs.callCount).to.be.eq(2);
  });

  it('222', () => {
    const listenerC1 = sinon.spy();
    const listenerC3 = sinon.spy();
    const listenerC5 = sinon.spy();
    const listenerObs = sinon.spy();

    const v1 = new Observable(5, { name: 'v1' });
    const v2 = new Observable(10, { name: 'v2' });
    const v3 = new Observable(false, { name: 'v3' });
    const v4 = new Observable(false, { name: 'v4' });

    const c0 = new Computed(() => v2.get() + 2, { name: 'с0' });
    const c1 = new Computed(() => c0.get() * 4, { name: 'с1', onChange: listenerC1 });
    const c2 = new Computed(() => v3.get() ? c1.get() : 0, { name: 'с2' });
    const c3 = new Computed(() => v1.get() + c2.get(), { name: 'с3', onChange: listenerC3 });
    const c4 = new Computed(() => v4.get() ? c1.get() : 2, { name: 'с4' });
    const c5 = new Computed(() => c2.get() + c4.get(), { name: 'с5', onChange: listenerC5 });

    const obs = new Observer(() => c3.get() + c5.get(), listenerObs);
    transaction(() => {
      v3.set(true);
      v4.set(true);
      v3.set(false);
    });
    v4.set(false);
  });
})