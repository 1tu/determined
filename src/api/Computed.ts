import { EValueState, ILambda, ILambdaValue, IReciever, IRecieverProps, IValue, IValueProps, NOT_CHANGED } from '../inner/types';
import { EMPTY_OBJECT } from '../util/util';
import { Value } from '../inner/Value';
import { Reciever } from '../inner/Reciever';

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
    if (this._value.state === EValueState.Dirty) return this._reciever.pull();
    else if (this._value.state === EValueState.Check) {
      for (let input of this._reciever.inputSet) {
        if (input.poll(true)) return this._reciever.pull();
      }
      throw NOT_CHANGED;
    }
    else throw NOT_CHANGED;
  }

  private _onInputChange(dirty?: boolean) {
    this._value.state = dirty ? EValueState.Dirty : EValueState.Check;
  }
}