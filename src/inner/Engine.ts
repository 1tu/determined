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

  public emitter2Unlink(e: IEmitter) {
    this._emitterUnlinkSet.add(e);
  }

  public reciever2Update(r: IReciever) {
    this._recieverUpdateSet.add(r);
    if (!this.updateDepth) this._recieverUpdate();
  }

  public transaction(fn: ILambda) {
    this.updateDepth++;
    fn();
    this.updateDepth--;
    if (!this.updateDepth) this._recieverUpdate();
  }

  // обход графа
  public walk<CB extends ILambda>(r: IReciever, stepInto: CB): ReturnType<CB> {
    // ПОГРУЖАЕМСЯ по графу
    const recieverPrev = this._reciever;
    this._reciever = r;
    r.walkBefore();
    try {
      return stepInto();
    } finally {
      // ВСПЛЫВАЕМ обратно
      r.walkAfter();
      this._reciever = recieverPrev;
      if (!this._reciever) {
        // поидее в этот момент обход закончился и можно запускать Unlink
        // TODO: nextTick?
        setTimeout(() => this._emitterUnlink());
      }
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
      e.outputDelete(this._reciever);
    } else if (e.outputSet.size) {
      console.warn('No reciever for unlink', e)
    }
  }

  private _emitterUnlink() {
    if (!this._emitterUnlinkSet.size || this.job === EEngineJob.Unlink) return;
    const jobPrev = this.job;
    this.job = EEngineJob.Unlink;
    for (const emitter of this._emitterUnlinkSet) {
      emitter.poll();
    }
    this._emitterUnlinkSet.clear();
    this.job = jobPrev;
  }

  private _recieverUpdate() {
    if (this.job === EEngineJob.Unlink) console.error('Why unlink while LINK?!');
    this.job = EEngineJob.Link;
    for (const reciever of this._recieverUpdateSet) {
      reciever.pull();
    }
    this._recieverUpdateSet.clear();
    this.job = undefined;
  }
}

export const engine = new Engine();