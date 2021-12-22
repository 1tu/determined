import { EEngineJob, EValueState, ILambda, IRecieverProps, IRecieverValue, IValue, NOT_CHANGED } from './types';
import { EMPTY_OBJECT } from '../util/util';
import { Reciever } from './Reciever';
import { engine } from './Engine';

export class RecieverValue<V> extends Reciever<V> implements IRecieverValue<V> {
  private _pulling = false;

  constructor(pull: ILambda<V>, public value: IValue<V>, props: IRecieverProps<V> = EMPTY_OBJECT) {
    super(pull, props);
    this.context = this._props.context || this;
    this.value.set(() => this.get());
  }

  public override onInputChange(dirty?: boolean) {
    this.value.state = dirty ? EValueState.Dirty : EValueState.Check;
  }

  public get(): V {
    if (this.value.state === EValueState.Dirty) return this.pull();
    else if (this.value.state === EValueState.Check) {
      for (let input of this.inputSet) {
        if (input.poll(true)) return this.pull();
      }
      throw NOT_CHANGED;
    }
    else throw NOT_CHANGED;
  }

  public override dive() {
    if (this._pulling) throw TypeError('Circular pulling detected');
    this._pulling = true;
    super.dive();
  }

  public override lift() {
    // есть ли ЗАВИСИМЫЕ ОТ НАС
    const value = this.value;
    if (value.outputSet.size) {
      super.lift();
      // this._active = !!this.inputSet.size;
      value.state = EValueState.Actual;
    }
    // если нет зависимых от нас
    else {
      this._inputSetPrev = undefined;
      value.state = EValueState.Dirty;
    }
    this._pulling = false;
  }
}
