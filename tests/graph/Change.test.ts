import { expect } from 'chai';
import * as sinon from 'sinon';
import { Computed, Observable, Observer } from '../../src';

describe('Граф. Изменение', () => {
  it('Базовый', () => {
    const listenerObs = sinon.spy();

    const v1 = new Observable(5);
    const c1 = new Computed(() => v1.get() * 4);
    const obs = new Observer(() => c1.get(), listenerObs);

    v1.set(10);
    expect(listenerObs.callCount).to.be.eq(2);
  });

  it('Изменении зависимости', () => {
    const listenerC1 = sinon.spy();
    const listenerObs = sinon.spy();

    const v1 = new Observable(5);
    const v2 = new Observable(10);
    const v3 = new Observable(false);
    const c1 = new Computed(() => v2.get() * 4, { onChange: listenerC1 });
    const c2 = new Computed(() => v3.get() ? c1.get() : 0);
    const c3 = new Computed(() => v1.get() + c2.get());
    const obs = new Observer(() => c3.get(), listenerObs);

    v3.set(true);
    expect(listenerC1.callCount).to.be.eq(1);
    expect(listenerObs.callCount).to.be.eq(2);
  });

  it('Изменении зависимости. 2 пути к одному источнику', () => {
    const listenerC1 = sinon.spy();
    const listenerObs = sinon.spy();

    const v1 = new Observable(5, { name: 'v1' });
    const v2 = new Observable(10, { name: 'v2' });
    const v3 = new Observable(false, { name: 'v3' });
    const v4 = new Observable(false, { name: 'v4' });

    const c0 = new Computed(() => v2.get() + 2, { name: 'с0' });
    const c1 = new Computed(() => c0.get() * 4, { name: 'с1', onChange: listenerC1 });
    const c2 = new Computed(() => v3.get() ? c1.get() : 0, { name: 'с2' });
    const c3 = new Computed(() => v1.get() + c2.get(), { name: 'с3' });
    const c4 = new Computed(() => v4.get() ? c1.get() : 2, { name: 'с4' });
    const c5 = new Computed(() => c2.get() * c4.get(), { name: 'с5' });

    const obs = new Observer(() => c3.get() + c5.get(), listenerObs);
    v3.set(true);
    v3.set(false);
    expect(listenerC1.callCount).to.be.eq(1);
    expect(listenerObs.callCount).to.be.eq(3);
  });

  it('11', () => {
    // TODO
    const v1 = new Observable(5, { name: 'v1' });
    const v2 = new Observable(10, { name: 'v2' });
    const v3 = new Observable(false, { name: 'v3' });
    const v4 = new Observable(false, { name: 'v4' });

    const c0 = new Computed(() => v2.get() + 2, { name: 'с0' });
    const c1 = new Computed(() => c0.get() * 4, { name: 'с1', onChange: (v) => console.log('zzz', v) });
    const c2 = new Computed(() => v3.get() ? c1.get() : 0, { name: 'с2' });
    const c3 = new Computed(() => v1.get() + c2.get(), { name: 'с3', onChange: (v) => console.log('c3', v) });
    const c4 = new Computed(() => v4.get() ? c1.get() : 2, { name: 'с4' });
    const c5 = new Computed(() => c2.get() * c4.get(), { name: 'с5', onChange: (v) => console.log('c5', v) });

    const obs = new Observer(() => c3.get() + c5.get(), (v) => console.log('computed changed!', v));
    // transaction(() => {
    v3.set(true);
    // v4.set(true);
    // });
    v3.set(false);
    v4.set(true);
    v4.set(false);
  });
})