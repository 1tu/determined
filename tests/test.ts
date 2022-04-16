import { Observable } from '../src';
import { Computed } from '../src/api/Computed';
import { Observer } from '../src/api/Observer';

const v1 = new Observable(2, { name: 'v1' });
const v2 = new Observable(4, { name: 'v2' });
const с1 = new Computed(() => v1.get() + v2.get(), { name: 'с1' });
const с2 = new Computed(() => с1.get() * 2, { name: 'с2' });
const obs = new Observer(() => с2.get(), (v) => console.log('computed changed!', v));
v1.set(3);
v1.set(4);