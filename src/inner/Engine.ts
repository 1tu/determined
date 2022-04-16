import { IEmitter, ILambda, IReciever } from './types';

class Engine {
  public updateDepth = 0;

  private _reciever?: IReciever;
  private _noHandle = false;
  private _recieverUpdateList = new Set<IReciever>();

  public link(e: IEmitter) {
    if (this._noHandle) return;
    if (this._reciever) {
      this._reciever.downAdd(e);
      e.upAdd(this._reciever);
    } else {
      console.warn('Read value out of reaction', e.props ? e.props.name : undefined)
    }
  }

  // почему просто не вызвать .get()?
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
    }
  }

  private _recieverUpdate() {
    for (const reciever of this._recieverUpdateList) reciever.get();
    this._recieverUpdateList.clear();
  }
}

export const engine = new Engine();