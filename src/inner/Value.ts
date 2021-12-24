import { config } from '../config';
import { EEngineJob, EValueState, IComparer, ILambda, ILambdaValue, IReciever, IValue, IValueProps, VALUE_NEXT_EMPTY, VALUE_NOT_CHANGED } from "./types";
import { isFunction } from "../util/util";
import { Emitter } from './Emitter';
import { engine } from './Engine';

export class Value<V = any> extends Emitter<IValueProps<V>> implements IValue<V> {
  private _get?: ILambda<V>;
  private _comparer: IComparer;
  private _valueNext?: V | typeof VALUE_NEXT_EMPTY = VALUE_NEXT_EMPTY;
  private _value?: V;
  private _valuePrev?: V;

  private _state = EValueState.Actual;
  public get state() { return this._state; }
  public set state(v: EValueState) {
    if (this._state === v) return;
    this._state = v;
    if (v !== EValueState.Actual) this.changed();
  }

  public error?: Error;

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

  public getPrev() {
    return this._valuePrev;
  }

  public override poll(skip?: boolean) {
    super.poll(skip);
    // если выполняем задачу по разлинковке, нам нужно в любом случае проходить до самого корня
    // подграфа который перестал наблюдаться
    if (engine.job === EEngineJob.Unlink) {
      if (this._get) this._get();
    } else if (this.state !== EValueState.Actual) {
      try {
        return this._set(this._get ? this._get() : this._valueNext as V);
      } catch (e) {
        if (e !== VALUE_NOT_CHANGED) {
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
      this._state = EValueState.Dirty;
    } else {
      isChanged = this._next(lv);
      this._state = isChanged ? EValueState.Dirty : EValueState.Actual;
    }

    if (isChanged) this.changed();
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

  private _set(v?: V) {
    this.error = undefined;
    this._valueNext = VALUE_NEXT_EMPTY;

    const isChanged = !this._comparer(v, this._value);
    if (isChanged) {
      this._valuePrev = this._value;
      this._value = v;
      if (this.props.onChange) this.props.onChange(this._value);
    }
    return isChanged;
  }

  private _next(v?: V) {
    const isChanged = this._valueNext === VALUE_NEXT_EMPTY ? !this._comparer(v, this._value) : true;
    this._valueNext = v;
    return isChanged;
  }
}