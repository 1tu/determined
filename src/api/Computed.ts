import { EEngineJob, EEmitterState, ILambda, IReciever, IRecieverProps, IValue, IValueProps, VALUE_NOT_CHANGED } from '../inner/types';
import { Value } from '../inner/Value';
import { Reciever } from '../inner/Reciever';
import { engine } from '../inner/Engine';

interface IComputedProps<V> extends Omit<IRecieverProps<V>, 'onInputChange'>, IValueProps<V> {
}

export class Computed<V> {
  private _value: IValue<V>;
  private _reciever: IReciever;

  public get() {
    return this._value.get();
  }

  public getPrev() {
    return this._value.getPrev();
  }

  constructor(lambda: ILambda<V>, props?: IComputedProps<V>) {
    this._value = new Value(() => this._get(), props);
    this._reciever = new Reciever(lambda, this._value, props);
  }

  private _get(): V {
    if (this._value.state !== EEmitterState.Actual || engine.job === EEngineJob.Unlink) {
      try {
        return this._reciever.get();
      } catch (e) {
        if (e !== VALUE_NOT_CHANGED) throw e;
        return this._value.cache_;
      }
    }
    return this._value.cache_;
  }
}