import { Computed } from '../src/api/Computed';
import { Observer } from '../src/api/Observer';
import { Value } from '../src/inner/Value';

const v1 = new Value(2, { name: 'v1' });
const v2 = new Value(4, { name: 'v2' });
const с1 = new Computed(() => v1.get() + v2.get(), { name: 'с1' });
const с2 = new Computed(() => с1.get() * 2, { name: 'с2' });
const obs = new Observer(() => с2.get(), (v) => console.log('computed changed!', v));
v1.set(3);