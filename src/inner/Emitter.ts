import { engine } from './Engine';
import { IRecieverBase, IEmitter, IEmitterProps, EEmitterState } from "./types";

export class Emitter<P extends IEmitterProps> implements IEmitter<P> {
  public state = EEmitterState.Dirty;

  // КТО зависит ОТ НАС
  public upList = new Set<IRecieverBase>();

  public get isObserved() {
    return !!this.upList.size;
  }

  public get isActual() {
    return this.state === EEmitterState.Actual;
  }

  constructor(public props?: P) { }

  public actualize(skipLink?: boolean) {
    this._link(skipLink);
    return false;
  }

  public changed() {
    this.state = EEmitterState.Dirty;
    if (this.isObserved) {
      engine.transaction(() => {
        for (const up of this.upList) up.onDownChanged();
      });
    }
  }

  public downChanged() {
    this.changed();
  }

  public upAdd(r: IRecieverBase) {
    this.upList.add(r);
  }

  public upDelete(r: IRecieverBase) {
    this.upList.delete(r);
    if (!this.isObserved) this._onUnobserved();
  }

  protected _onUnobserved() {
    this.state = EEmitterState.Dirty;
  }

  protected _link(skipLink?: boolean) {
    if (!skipLink) engine.link(this);
  }
}