import { engine } from '../inner/Engine';
import { Reciever } from '../inner/Reciever';
import { IEmitterBase, ILambda, IReciever } from '../inner/types';

export class Observer<V> implements IEmitterBase {
  private _reciever: IReciever<V>;

  constructor(pull: ILambda<V>, private _effect: ILambda<void, V>) {
    this._reciever = new Reciever(pull, this, { onGet: this._effect });
    this.downChanged();
  }

  public dispose() {
    for (let down of this._reciever.downList) {
      down.upDelete(this._reciever);
    }
  }

  public downChanged() {
    engine.reciever2Update(this._reciever);
  }
}
