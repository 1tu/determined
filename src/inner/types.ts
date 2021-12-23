export type ILambda<V = any, P = any> = (p?: P) => V;
export type ILambdaValue<V = any> = V | ILambda<V>;
export type IComparer<V = any> = (v1: V, prev: V) => boolean;

export const NOT_CHANGED = Symbol('VALUE NOT CHANGED');
export const NEXT_EMPTY = Symbol('VALUE NEXT EMPTY');

// REVIEVER (data layer)
export interface IReciever<V = any> {
  readonly context: object;
  readonly inputSet: Set<IEmitter>;
  onInputChange(dirty?: boolean): void;
  // получить новое значение
  pull(): V;
  // ПОГРУЖАЕМСЯ по графу
  walkBefore(): void;
  // ВСПЛЫВАЕМ
  walkAfter(): void;
  inputAdd(e: IEmitter): void;
}

export interface IRecieverProps<V> {
  context?: object;
  onInputChange?(dirty?: boolean): void;
  onChange?(v: V): void;
}

// VALUE (domain layer)
export enum EValueState {
  Actual,
  Check,
  Dirty,
}

export interface IValue<V = any> extends IEmitter<IValueProps<V>> {
  state: EValueState;
  get(): V;
  getPrev(): V;
  set(lv: ILambdaValue<V>): boolean;
}

export interface IValueProps<V> extends IEmitterProps {
  comparer?: IComparer<V>;
}

// EMITTER (view layer)
export interface IEmitter<P extends IEmitterProps = IEmitterProps> {
  readonly props: P;
  readonly outputSet: Set<IReciever>;
  //  return isChanged
  poll(skipEngine?: boolean): boolean;
  changed(dirty?: boolean): void;
  outputAdd(r: IReciever): void;
  outputDelete(r: IReciever): void;
}

export interface IEmitterProps {
  // debug
  name?: string;
}

export enum EEngineJob {
  Link,
  Unlink,
}