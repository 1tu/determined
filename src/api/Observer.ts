import { engine } from '../inner/Engine';
import { Reciever } from '../inner/Reciever';
import { ILambda, IReciever } from '../inner/types';

export class Observer<V> {
  private _reciever: IReciever<V>;

  constructor(pull: ILambda<V>, private _effect: ILambda<void, V>) {
    this._reciever = new Reciever(pull, { onChange: this._effect, onInputChange: this._onInputChange.bind(this) });
    this._onInputChange();
  }

  public dispose() {
    for (let input of this._reciever.inputSet) {
      input.outputDelete(this._reciever);
    }
  }

  private _onInputChange() {
    engine.reciever2Update(this._reciever);
  }
}
