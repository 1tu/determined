import { EEngineJob, IEmitter, ILambda, IReciever } from './types';

class Engine {
  public job?: EEngineJob;
  public updateDepth = 0;

  private _reciever?: IReciever;
  private _emitterUnlinkSet = new Set<IEmitter>();
  private _recieverUpdateSet = new Set<IReciever>();

  public emitterHandle(e: IEmitter) {
    if (this.job === EEngineJob.Link) this._link(e);
    else if (this.job === EEngineJob.Unlink) this._unlink(e);
  }

  public emitterChange(e: IEmitter, dirty?: boolean) {
    if (!e.outputSet.size) return;
    this.updateDepth++;
    for (const output of e.outputSet) output.onInputChange(dirty);
    this.updateDepth--;
    if (!this.updateDepth) this._recieverUpdate();
  }

  public emitter2Unlink(e: IEmitter) {
    this._emitterUnlinkSet.add(e);
  }

  public reciever2Update(r: IReciever) {
    this._recieverUpdateSet.add(r);
    if (!this.updateDepth) this._recieverUpdate();
  }

  public walk<CB extends ILambda>(r: IReciever, stepInto: CB): ReturnType<CB> {
    // ПОГРУЖАЕМСЯ по графу
    const recieverPrev = this._reciever;
    this._reciever = r;
    r.dive();
    try {
      return stepInto();
    } finally {
      // ВСПЛЫВАЕМ обратно
      r.lift();
      if (recieverPrev === undefined) {
        // поидее в этот момент обход закончился и можно запускать Unlink
        // TODO: nextTick?
        this._emitterUnlink();
      }
      this._reciever = recieverPrev;
    }
  }

  private _link(e: IEmitter) {
    if (this._reciever) {
      this._reciever.inputAdd(e);
      e.outputAdd(this._reciever);
    } else {
      console.warn('No reciever for link', e)
    }
  }

  private _unlink(e: IEmitter) {
    if (this._reciever) {
      this._reciever.inputDelete(e);
      e.outputDelete(this._reciever);
    } else {
      console.warn('No reciever for unlink', e)
    }
  }

  private _emitterUnlink() {
    this.job = EEngineJob.Unlink;
    for (const emitter of this._emitterUnlinkSet) {
      emitter.poll();
    }
    this._emitterUnlinkSet.clear();
    this.job = undefined;
  }

  

  private _recieverUpdate() {
    this.job = EEngineJob.Link;
    for (const reciever of this._recieverUpdateSet) {
      reciever.pull();
    }
    this._recieverUpdateSet.clear();
    this.job = undefined;
  }
}

export const engine = new Engine();