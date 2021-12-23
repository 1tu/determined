import { EEngineJob, EValueState, ILambda, ILambdaValue, IReciever, IRecieverProps, IValue, IValueProps, VALUE_NOT_CHANGED } from '../inner/types';
import { EMPTY_OBJECT } from '../util/util';
import { Value } from '../inner/Value';
import { Reciever } from '../inner/Reciever';
import { engine } from '../inner/Engine';

interface IComputedProps<V> extends Omit<IRecieverProps<V>, 'onInputChange'>, IValueProps<V> {
}

export class Computed<V> {
  private _value: IValue<V>;
  private _reciever: IReciever;

  constructor(calc: ILambda<V>, props: IComputedProps<V> = EMPTY_OBJECT) {
    this._value = new Value(() => this._get(), props);
    this._reciever = new Reciever(calc, { ...props, onInputChange: this._onInputChange.bind(this) });
  }

  public get() {
    return this._value.get();
  }

  public getPrev() {
    return this._value.getPrev();
  }

  public set(lv: ILambdaValue<V>) {
    return this._value.set(lv);
  }

  private _get(): V {
    if (this._value.state !== EValueState.Actual || engine.job === EEngineJob.Unlink)
      return this._reciever.pull();
    throw VALUE_NOT_CHANGED;
  }

  private _onInputChange() {
    this._value.state = EValueState.Dirty;
  }
}