import { EEmitterState, IReciever, IValueBase, IValueProps } from "./types";
import { ValueBase } from './ValueBase';

export class Value<V = any> extends ValueBase<V, IValueProps<V>> implements IValueBase<V, IValueProps<V>> {
  public error?: Error;

  constructor(protected _reciever: IReciever, props?: IValueProps<V>) {
    super(undefined, props);
  }

  public override actualize(skipLink?: boolean): boolean {
    super._link(skipLink);
    // TODO: возможно её можно только если не актуальное значение?
    let isChanged = false;
    // если выполняем задачу по разлинковке, нам нужно в любом случае проходить до самого корня
    // подграфа который перестал наблюдаться
    if (!this.isActual) {
      try {
        isChanged = this._set(this._reciever.get());
      } catch (e) {
        this.error = e;
      }
      this.state = EEmitterState.Actual;
    }
    if (this.error) throw this.error;
    return isChanged;
  }

  public override set(v: V) {
    // TODO: нужно научиться устанавливать зависимости так, чтобы получилось в итоге нужное значение
  }

  protected override _onUnobserved() {
    super._onUnobserved();
    this._value = undefined;
    // this._valuePrev = undefined;
    this._reciever.dispose();
  }

  // всплываем
  protected override _set(v?: V): boolean {
    this.error = undefined;

    // const valuePrev = this._value;
    // const isChanged = super._set(v);
    // if (isChanged) this._valuePrev = valuePrev;
    return super._set(v);
  }
}