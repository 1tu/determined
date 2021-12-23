import { engine } from '../inner/Engine';
import { ILambda } from '../inner/types';

export function transaction(fn: ILambda) {
  engine.transaction(fn);
}