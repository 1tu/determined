import { engine } from './Engine';
import { EEngineJob, IEmitter, IEmitterBase, ILambda, IReciever, IRecieverProps, VALUE_NOT_CHANGED } from './types';

export class Reciever<V = any> implements IReciever<V> {
  public downList = new Set<IEmitter>();
  private _downPrevList?: Set<IEmitter>;

  constructor(private _lambda: ILambda<V>, private _emitter: IEmitterBase, private _props?: IRecieverProps<V>) {
  }

  public onDownChanged() {
    this._emitter.downChanged();
  }

  public get(): V {
    if (!this.downList.size || engine.job === EEngineJob.Unlink) return this._get();
    for (let down of this.downList) {
      if (down.actualize(true)) return this._get();
    }
    return engine.lambdaActualValueGet(this._lambda);
  }

  public walkDown() {
    if (this._downPrevList) throw new Error('Circular pulling detected');
    this._downPrevList = this.downList;
    this.downList = new Set();
  }

  public walkUp() {
    // отписаться от неактуальных зависимостей
    for (let downPrev of this._downPrevList) {
      if (!this.downList.has(downPrev)) downPrev.upDelete(this);
    }
    this._downPrevList = undefined;
  }

  public downAdd(e: IEmitter) {
    this.downList.add(e);
  }

  private _get(): V {
    const v = engine.walk(this, this._lambda);
    if (this._props && this._props.onGet && engine.job !== EEngineJob.Unlink) this._props.onGet(v);
    return v;
  }
}
