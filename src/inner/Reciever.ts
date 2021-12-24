import { engine } from './Engine';
import { EEngineJob, IEmitter, ILambda, IReciever, IRecieverProps, VALUE_NOT_CHANGED } from './types';
import { EMPTY_OBJECT } from '../util/util';

export class Reciever<V = any> implements IReciever<V> {
  public context: object;
  public inputSet: Set<IEmitter> = new Set();

  private _inputPrevSet?: Set<IEmitter>;

  constructor(private _pullFn: ILambda<V>, private _props: IRecieverProps<V> = EMPTY_OBJECT) {
    this.context = this._props.context || this;
  }

  public onInputChange() {
    if (this._props.onInputChange) this._props.onInputChange();
  }

  public pull(): V {
    if (!this.inputSet.size || engine.job === EEngineJob.Unlink) return this._pull();
    for (let input of this.inputSet) {
      if (input.poll(true)) return this._pull();
    }
    throw VALUE_NOT_CHANGED;
  }

  public walkBefore() {
    if (this._inputPrevSet) throw new Error('Circular pulling detected');
    this._inputPrevSet = this.inputSet;
    this.inputSet = new Set();
  }

  public walkAfter() {
    // отписаться от неактуальных зависимостей
    for (let inputPrev of this._inputPrevSet) {
      if (!this.inputSet.has(inputPrev)) inputPrev.outputDelete(this);
    }
    this._inputPrevSet = undefined;
  }

  public inputAdd(e: IEmitter) {
    this.inputSet.add(e);
  }

  private _pull(): V {
    const v = engine.walk(this, () => this._pullFn.call(this.context));
    if (this._props.onPull && engine.job !== EEngineJob.Unlink) this._props.onPull(v);
    return v;
  }
}
