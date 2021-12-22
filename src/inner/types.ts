export type ILambda<V = any, P = any> = (p?: P) => V;
export type ILambdaValue<V = any> = V | ILambda<V>;
export type IComparer<V = any> = (v1: V, prev: V) => boolean;

export const NOT_CHANGED = Symbol('VALUE NOT CHANGED');

// REVIEVER (data layer)
export interface IReciever<V = any> {
  readonly context: object;
  inputSet: Set<IEmitter>;
  onInputChange(dirty?: boolean): void;
  // получить новое значение
  pull(): V;
  // ПОГРУЖАЕМСЯ по графу
  dive(): void;
  // ВСПЛЫВАЕМ
  lift(): void;
  inputAdd(e: IEmitter): void;
  inputDelete(e: IEmitter): void;
}

export interface IRecieverValue<V = any> extends IReciever {
  readonly value: IValue<V>;
  get(): V;
}

export interface IRecieverProps<V> {
  context?: object;
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
  set(lv: ILambdaValue<V>): boolean;
}

export interface IValueProps<V> extends IEmitterProps {
  comparer?: IComparer<V>;
}

// EMITTER (view layer)
export interface IEmitter<P extends IEmitterProps = IEmitterProps> {
  readonly props: P;
  readonly outputSet: Set<IReciever>;
  // return isChanged
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