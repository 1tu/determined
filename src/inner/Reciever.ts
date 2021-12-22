import { engine } from './Engine';
import { IEmitter, ILambda, IReciever, IRecieverProps } from './types';
import { EMPTY_OBJECT } from '../util/util';

export class Reciever<V = any> implements IReciever<V> {
  public context: object;
  public inputSet: Set<IEmitter> = new Set();

  protected _inputSetPrev?: Set<IEmitter>;
  // отслеживается ???
  protected _active = false;

  constructor(protected _pull: ILambda<V>, protected _props: IRecieverProps<V> = EMPTY_OBJECT) {
    this.context = this._props.context || this;
  }

  public onInputChange() {
    engine.reciever2Update(this);
  }

  public pull(): V {
    const v = engine.walk(this, () => this._pull.call(this.context));
    if (this._props.onChange) this._props.onChange(v);
    return v;
  }

  // ПОГРУЖАЕМСЯ по графу
  public dive() {
    this._inputSetPrev = this.inputSet;
    this.inputSet = new Set();
  }

  // ВСПЛЫВАЕМ
  public lift() {
    // подписаться на новые зависимости
    let inputNewCount = 0;
    for (let input of this.inputSet) {
      if (!this._inputSetPrev.has(input)) {
        input.outputAdd(this);
        inputNewCount++;
      }
    }

    // отписаться от неактуальных зависимостей
    if (this.inputSet.size - inputNewCount < this._inputSetPrev.size) {
      for (let inputPrev of this._inputSetPrev) {
        if (!this.inputSet.has(inputPrev)) inputPrev.outputDelete(this);
      }
    }
    this._inputSetPrev = undefined;
  }

  public inputAdd(e: IEmitter) {
    this.inputSet.add(e);
  }

  public inputDelete(e: IEmitter) {
    this.inputSet.delete(e);
  }
}
