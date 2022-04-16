import { config } from '../config';
import { EEngineJob, EEmitterState, IComparer, ILambdaValue, IValueBase, IValueBaseProps } from "./types";
import { Emitter } from './Emitter';
import { isFunction } from "../util/util";
import { engine } from './Engine';

export class ValueBase<V = any, P extends IValueBaseProps<V> = IValueBaseProps<V>> extends Emitter<P> implements IValueBase<V> {
  protected _comparer: IComparer;
  protected _value?: V;

  constructor(lv?: ILambdaValue<V>, props?: P) {
    super(props);
    this._comparer = this.props.comparer || config.comparer;
    if (lv !== undefined && !isFunction(lv)) this.set(lv);
  }

  public get cache_() {
    return this._value;
  }

  public get(): V {
    this.actualize();
    return this._value;
  }

  public override actualize(skipLink?: boolean) {
    super._link(skipLink);
    if (engine.job === EEngineJob.Unlink) {
      return false;
    } else if (this.state !== EEmitterState.Actual && this.isObserving) {
      this.state = EEmitterState.Actual;
      return true;
    }
    return false;
  }

  public set(v: ILambdaValue<V>) {
    if (this._set(v as V)) this.changed();
  }

  protected _set(v?: V) {
    const isChanged = !this._comparer(v, this._value);
    if (isChanged) {
      this._value = v;
      if (this.props.onChange) this.props.onChange(this._value);
    }
    return isChanged;
  }
}