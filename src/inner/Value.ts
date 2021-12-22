import { config } from '../config';
import { EValueState, IComparer, ILambda, ILambdaValue, IReciever, IValue, IValueProps, NOT_CHANGED } from "./types";
import { isFunction } from "../util/util";
import { Emitter } from './Emitter';

export class Value<V = any> extends Emitter<IValueProps<V>> implements IValue<V> {
  private _get?: ILambda<V>;
  private _comparer: IComparer;
  private _value?: V;
  private _valuePrev?: V;

  private _state = EValueState.Actual;
  public get state() { return this._state; }
  public set state(v: EValueState) {
    if (this._state === v) return;
    this._state = v;
    if (v !== EValueState.Actual) this.changed(false);
  }

  public error?: Error;

  // reciever set LV || or
  constructor(lv?: ILambdaValue<V>, props?: IValueProps<V>) {
    super(props);
    this._comparer = this.props.comparer || config.comparer;
    if (lv !== undefined) this.set(lv);
  }

  public get() {
    this.poll();
    if (this.error) throw this.error;
    return this._value;
  }

  public override poll(skip?: boolean) {
    super.poll(skip);
    if (this.state !== EValueState.Actual) {
      try {
        return this._next(this._get());
      } catch (e) {
        if (e !== NOT_CHANGED) {
          this.error = e;
          throw e;
        }
      } finally {
        this.state = EValueState.Actual;
      }
    }
    return false;
  }

  public set(lv: ILambdaValue<V>) {
    this.error = undefined;
    let isChanged = true;

    if (isFunction(lv)) {
      this._get = lv;
      this.state = EValueState.Dirty;
    } else {
      isChanged = this._next(lv);
      this.state = EValueState.Actual;
    }

    if (isChanged) this.changed(true);
    return isChanged;
  }

  public override outputDelete(r: IReciever) {
    super.outputDelete(r);
    if (!this.outputSet.size && this._get) {
      this.state = EValueState.Dirty;
      this._value = undefined;
      this._valuePrev = undefined;
    }
  }

  private _next(v: V) {
    this.error = undefined;
    const isChanged = !this._comparer(v, this._value);
    if (isChanged) {
      this._valuePrev = this._value;
      this._value = v;
    }
    return isChanged;
  }
}