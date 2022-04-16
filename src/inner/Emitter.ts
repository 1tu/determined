import { engine } from './Engine';
import { EEngineJob, IRecieverBase, IEmitter, IEmitterProps, EEmitterState } from "./types";
import { EMPTY_OBJECT } from '../util/util';

export class Emitter<P extends IEmitterProps> implements IEmitter<P> {
  public state = EEmitterState.Actual;

  // КТО зависит ОТ НАС
  public upList = new Set<IRecieverBase>();

  public get isObserving() {
    return !!this.upList.size;
  }

  constructor(public props: P = EMPTY_OBJECT as P) { }

  public actualize(skipLink?: boolean) {
    this._link(skipLink);
    return false;
  }

  public changed() {
    this.state = EEmitterState.Dirty;
    if (!this.upList.size) return;
    engine.transaction(() => {
      for (const up of this.upList) up.onDownChanged();
    });
  }

  public downChanged() {
    this.changed();
  }

  public upAdd(r: IRecieverBase) {
    this.upList.add(r);
  }

  public upDelete(r: IRecieverBase) {
    this.upList.delete(r);
    // TODO: что если позже добавится up?
    if (!this.isObserving) this._onUnobserved();
  }

  protected _onUnobserved() {
    this.state = EEmitterState.Dirty;
    if (engine.job === EEngineJob.Link) engine.emitter2Unlink(this);
  }

  protected _link(skipLink?: boolean) {
    if (!skipLink) engine.emitterHandle(this);
  }
}