import { ILambda, ILambdaValue, IRecieverProps, IRecieverValue, IValue, IValueProps } from '../inner/types';
import { EMPTY_OBJECT } from '../util/util';
import { RecieverValue } from '../inner/RecieverValue';
import { Value } from '../inner/Value';

export class Computed<V> {
  private _value: IValue<V>;
  private _reciever: IRecieverValue;

  constructor(calc: ILambda<V>, props: IRecieverProps<V> & IValueProps<V> = EMPTY_OBJECT) {
    this._value = new Value(undefined, props);
    this._reciever = new RecieverValue(calc, this._value, props);
  }

  public get() {
    return this._value.get();
  }

  public set(lv: ILambdaValue<V>) {
    return this._value.set(lv);
  }
}