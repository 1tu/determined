import { config } from '../config';
import { EEmitterState, IComparer, IValueBase, IValueBaseProps } from "./types";
import { Emitter } from './Emitter';

export class ValueBase<V = any, P extends IValueBaseProps<V> = IValueBaseProps<V>> extends Emitter<P> implements IValueBase<V> {
  protected _comparer: IComparer;
  protected _value?: V;

  public get value() {
    return this._value;
  }

  constructor(v?: V, props?: P) {
    super(props);
    this._comparer = this.props ? this.props.comparer || config.comparer : config.comparer;
    this.set(v);
  }

  public get(): V {
    this.actualize();
    return this._value;
  }

  public override actualize(skipLink?: boolean) {
    super._link(skipLink);
    if (!this.isActual && this.isObserved) {
      this.state = EEmitterState.Actual;
      return true;
    }
    return false;
  }

  public set(v?: V) {
    if (this._set(v)) this.changed();
  }

  protected _set(v?: V) {
    const isChanged = !this._comparer(v, this._value);
    if (isChanged) {
      this._value = v;
      if (this.props && this.props.onChange) this.props.onChange(this._value);
    }
    return isChanged;
  }
}