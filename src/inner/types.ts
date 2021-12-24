export type ILambda<V = any, P = any> = (p?: P) => V;
export type ILambdaValue<V = any> = V | ILambda<V>;
export type IComparer<V = any> = (v1: V, prev: V) => boolean;

export const VALUE_NOT_CHANGED = Symbol('VALUE NOT CHANGED');
export const VALUE_NEXT_EMPTY = Symbol('VALUE NEXT EMPTY');

// REVIEVER (data layer)
export interface IReciever<V = any> {
  readonly context: object;
  readonly inputSet: Set<IEmitter>;
  onInputChange(): void;
  // получить новое значение, может выбросить VALUE_NOT_CHANGED
  pull(): V;
  // ПОГРУЖАЕМСЯ по графу
  walkBefore(): void;
  // ВСПЛЫВАЕМ
  walkAfter(): void;
  inputAdd(e: IEmitter): void;
}

export interface IRecieverProps<V> {
  context?: object;
  onInputChange?(): void;
  onPull?(v: V): void;
}

// VALUE (domain layer)
export enum EValueState {
  Actual,
  Dirty,
}

export interface IValue<V = any> extends IEmitter<IValueProps<V>> {
  state: EValueState;
  // тут нельзя выбрасывать VALUE_NOT_CHANGED!
  get(): V;
  getPrev(): V;
  set(lv: ILambdaValue<V>): boolean;
}

export interface IValueProps<V> extends IEmitterProps {
  comparer?: IComparer<V>;
  onChange?(v: V): void;
}

// EMITTER (view layer)
export interface IEmitter<P extends IEmitterProps = IEmitterProps> {
  readonly props: P;
  readonly outputSet: Set<IReciever>;
  //  return isChanged
  poll(skipEngine?: boolean): boolean;
  changed(): void;
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