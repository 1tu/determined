import { EEngineJob, IEmitter, ILambda, IReciever, VALUE_NOT_CHANGED } from './types';

class Engine {
  public job?: EEngineJob;
  public updateDepth = 0;

  private _reciever?: IReciever;
  private _noHandle = false;
  private _emitterUnlinkList = new Set<IEmitter>();
  private _recieverUpdateList = new Set<IReciever>();

  public emitterHandle(e: IEmitter) {
    if (this._noHandle) return;
    if (this.job === EEngineJob.Link) this._link(e);
    else if (this.job === EEngineJob.Unlink) this._unlink(e);
  }

  public emitter2Unlink(e: IEmitter) {
    this._emitterUnlinkList.add(e);
  }

  public reciever2Update(r: IReciever) {
    this._recieverUpdateList.add(r);
    if (!this.updateDepth) this._recieverUpdate();
  }

  public transaction(fn: ILambda) {
    this.updateDepth++;
    fn();
    this.updateDepth--;
    if (!this.updateDepth) this._recieverUpdate();
  }

  public lambdaActualValueGet(fn: ILambda) {
    this._noHandle = true;
    const res = fn();
    this._noHandle = false;
    return res;
  }

  // обход графа
  public walk<CB extends ILambda>(r: IReciever, stepInto: CB): ReturnType<CB> {
    // ПОГРУЖАЕМСЯ по графу
    const recieverPrev = this._reciever;
    this._reciever = r;
    r.walkDown();
    try {
      return stepInto();
    } finally {
      // ВСПЛЫВАЕМ обратно
      r.walkUp();
      this._reciever = recieverPrev;
      if (!this._reciever) {
        // поидее в этот момент обход закончился и можно запускать Unlink
        // TODO: nextTick? setTimeout тут даёт баги
        this._emitterUnlink();
      }
    }
  }

  private _link(e: IEmitter) {
    if (this._reciever) {
      this._reciever.downAdd(e);
      e.upAdd(this._reciever);
    } else {
      console.warn('No reciever for link', e)
    }
  }

  private _unlink(e: IEmitter) {
    if (this._reciever) {
      e.upDelete(this._reciever);
    } else if (e.upList.size) {
      console.warn('No reciever for unlink', e)
    }
  }

  private _emitterUnlink() {
    if (!this._emitterUnlinkList.size || this.job === EEngineJob.Unlink) return;
    const jobPrev = this.job;
    this.job = EEngineJob.Unlink;
    for (const emitter of this._emitterUnlinkList) {
      emitter.actualize();
    }
    this._emitterUnlinkList.clear();
    this.job = jobPrev;
  }

  private _recieverUpdate() {
    if (this.job === EEngineJob.Unlink) console.error('Why unlink while LINK?!');
    this.job = EEngineJob.Link;
    for (const reciever of this._recieverUpdateList) {
      try {
        reciever.get();        
      } catch (e) {
        if (e !== VALUE_NOT_CHANGED) throw e;
      }
    }
    this._recieverUpdateList.clear();
    this.job = undefined;
  }
}

export const engine = new Engine();