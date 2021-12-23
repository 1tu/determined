import { expect } from 'chai';
import * as sinon from 'sinon';
import { Computed, Observable, Observer } from '../../src';

describe('Граф. Отписка', () => {
  it(' от устаревших зависимостей и деактивация подграфа', () => {
    // const v1 = new Observable(5, { name: 'v1' });
    // const v2 = new Observable(10, { name: 'v2' });
    // const v3 = new Observable(false, { name: 'v3' });
    // const v4 = new Observable(false, { name: 'v4' });

    // const c0 = new Computed(() => v2.get() + 2, { name: 'с0' });
    // const c1 = new Computed(() => c0.get() * 4, { name: 'с1', onChange: (v) => console.log('zzz', v) });
    // const c2 = new Computed(() => v3.get() ? c1.get() : 0, { name: 'с2' });
    // const c3 = new Computed(() => v1.get() + c2.get(), { name: 'с3' });
    // const c4 = new Computed(() => v4.get() ? c1.get() : 2, { name: 'с4' });
    // const c5 = new Computed(() => c2.get() * c4.get(), { name: 'с5' });

    // const obs = new Observer(() => c3.get() + c5.get(), (v) => console.log('computed changed!', v));
  })

  it('Пропустить отписку при исчесновении ЗАВИСИМЫХ а потом появлении в рамках одного прохода', () => {
    // Не отписываемся, если при обновлении графа, сначала все ЗАВИСИМЫЕ исчезли, а потом появилась новая зависимость
    // когда при очередном WalkLink.lift - input.outputSet.size стал 0, 
    // надо зарегистрировать этот input на проверку, и возможно отписку подграфа друг от друга (с удалением кэша?)
  })

  it('Отписка от одного из нескольких Observer', () => {
    // При 2+ активных обсерверах, когда один перестаёт наблюдать, 
    // переставать наблюдать его подграф, но не отписаться от зависимоитей остальных активных обсерверов
  })
})