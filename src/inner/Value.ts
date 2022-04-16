import { EEngineJob, EEmitterState, ILambda, IReciever, IValueBase, IValueProps, VALUE_NOT_CHANGED } from "./types";
import { engine } from './Engine';
import { ValueBase } from './ValueBase';

export class Value<V = any> extends ValueBase<V, IValueProps<V>> implements IValueBase<V, IValueProps<V>> {
  private _lambda: ILambda<V>;
  private _valuePrev?: V;

  public error?: Error;

  public getPrev() {
    return this._valuePrev;
  }

  constructor(lv?: ILambda<V>, props?: IValueProps<V>) {
    super(lv, props);
    if (lv !== undefined) this.set(lv);
  }

  public override actualize(skipLink?: boolean) {
    super._link(skipLink);
    // если выполняем задачу по разлинковке, нам нужно в любом случае проходить до самого корня
    // подграфа который перестал наблюдаться
    if (engine.job === EEngineJob.Unlink) {
      this._lambda();
    } else if (this.state !== EEmitterState.Actual) {
      try {
        return this._set(this._lambda());
      } catch (e) {
        this.error = e;
        throw e;
      } finally {
        this.state = EEmitterState.Actual;
      }
    }
    if (this.error) throw this.error;
    return false;
  }

  public override set(lv: ILambda<V>) {
    this._lambda = lv;
    this.error = undefined;
    this.changed();
  }

  protected override _onUnobserved() {
    this._value = undefined;
    this._valuePrev = undefined;
    super._onUnobserved();
  }

  // всплываем
  protected override _set(v?: V) {
    this.error = undefined;

    const valuePrev = this._value;
    const isChanged = super._set(v);
    if (isChanged) this._valuePrev = valuePrev;
    return isChanged;
  }
}