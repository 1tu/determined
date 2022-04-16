import { engine } from '../inner/Engine';
import { Reciever } from '../inner/Reciever';
import { ILambda, IReciever } from '../inner/types';

export class Observer<V> {
  private _reciever: IReciever<V>;

  constructor(pull: ILambda<V>, private _effect: ILambda<void, V>) {
    this._reciever = new Reciever(pull, { onGet: this._effect, onDownChange: this._onDownChange.bind(this) });
    this._onDownChange();
  }

  public dispose() {
    this._reciever.dispose();
  }

  private _onDownChange() {
    engine.reciever2Update(this._reciever);
  }
}
