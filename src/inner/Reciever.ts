import { engine } from './Engine';
import { EEmitterState, IEmitter, ILambda, IReciever, IRecieverProps, IValueBase, VALUE_NOT_CHANGED } from './types';

export class Reciever<V = any> implements IReciever<V> {
  public downList = new Set<IEmitter>();
  private _downPrevList?: Set<IEmitter>;

  public get isObserving() {
    return !!this.downList.size;
  }

  constructor(protected _lambda: ILambda<V>, private _props: IRecieverProps<V>) { }

  public onDownChanged() {
    this._props.onDownChange()
  }

  public get(): V {
    if (!this.isObserving) return this._get();
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

  public dispose() {
    for (let down of this.downList) down.upDelete(this);
    this.downList.clear();
  }

  private _get(): V {
    const v = engine.walk(this, this._lambda);
    if (this._props.onGet) this._props.onGet(v);
    return v;
  }
}
