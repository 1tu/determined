import { engine } from './Engine';
import { EEngineJob, IEmitter, ILambda, IReciever, IRecieverProps } from './types';
import { EMPTY_OBJECT } from '../util/util';

export class Reciever<V = any> implements IReciever<V> {
  public context: object;
  public inputSet: Set<IEmitter> = new Set();

  private _inputPrevSet?: Set<IEmitter>;

  constructor(private _pull: ILambda<V>, private _props: IRecieverProps<V> = EMPTY_OBJECT) {
    this.context = this._props.context || this;
  }

  public onInputChange(dirty?: boolean) {
    if (this._props.onInputChange) this._props.onInputChange(dirty);
  }

  public pull(): V {
    const v = engine.walk(this, () => this._pull.call(this.context));
    if (this._props.onChange && engine.job !== EEngineJob.Unlink) this._props.onChange(v);
    return v;
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
}
