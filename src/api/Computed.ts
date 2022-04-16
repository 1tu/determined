import { ILambda, IReciever, IRecieverProps, IValue, IValueProps } from '../inner/types';
import { Value } from '../inner/Value';
import { Reciever } from '../inner/Reciever';

interface IComputedProps<V> extends Omit<IRecieverProps<V>, 'onDownChange'>, IValueProps<V> {
}

export class Computed<V> {
  private _value: IValue<V>;
  private _reciever: IReciever;

  public get() {
    return this._value.get();
  }

  constructor(lambda: ILambda<V>, props?: IComputedProps<V>) {
    this._reciever = new Reciever(lambda, { ...props, onDownChange: this._onDownChange.bind(this) });
    this._value = new Value(this._reciever, props);
  }

  private _onDownChange() {
    this._value.downChanged();
  }
}