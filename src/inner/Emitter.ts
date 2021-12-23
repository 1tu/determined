import { engine } from './Engine';
import { EEngineJob, IEmitter, IEmitterProps, IReciever } from "./types";
import { EMPTY_OBJECT } from '../util/util';

export class Emitter<P extends IEmitterProps> implements IEmitter<P> {
  // КТО зависит ОТ НАС
  public outputSet = new Set<IReciever>();

  constructor(public props: P = EMPTY_OBJECT as P) { }

  public poll(skip?: boolean) {
    if (!skip) engine.emitterHandle(this);
    return false;
  }

  public changed() {
    if (!this.outputSet.size) return;
    engine.transaction(() => {
      for (const output of this.outputSet) output.onInputChange();
    });
  }

  public outputAdd(r: IReciever) {
    this.outputSet.add(r);
  }

  public outputDelete(r: IReciever) {
    this.outputSet.delete(r);
    // TODO: что если позже добавится output?
    if (!this.outputSet.size && engine.job === EEngineJob.Link) engine.emitter2Unlink(this);
  }
}