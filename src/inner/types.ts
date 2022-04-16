export type ILambda<V = any, P = any> = (p?: P) => V;
export type ILambdaValue<V = any> = V | ILambda<V>;
export type IComparer<V = any> = (v1: V, prev: V) => boolean;

export const VALUE_NOT_CHANGED = Symbol('VALUE NOT CHANGED');

// EMITTER (view layer)
export enum EEmitterState {
  Actual,
  Dirty,
}

export interface IEmitterProps {
  // debug
  name?: string;
}

export interface IEmitter<P extends IEmitterProps = IEmitterProps> {
  state: EEmitterState;
  readonly isActual: boolean;
  readonly upList: Set<IRecieverBase>;
  readonly isObserved: boolean;
  readonly props?: P;
  // return isChanged
  actualize(skipLink?: boolean): boolean;
  downChanged(): void;
  changed(): void;
  upAdd(r: IRecieverBase): void;
  upDelete(r: IRecieverBase): void;
}

// VALUE (domain layer)
export interface IValueBaseProps<V> extends IEmitterProps {
  onChange?(v: V): void;
  comparer?: IComparer<V>;
}

export interface IValueBase<V = any, P extends IValueBaseProps<V> = IValueBaseProps<V>> extends IEmitter<P> {
  readonly value: V;
  get(): V;
  set(v?: V): void;
}

export interface IValueProps<V> extends IValueBaseProps<V> {
}

export interface IValue<V = any> extends IValueBase<V, IValueProps<V>> {
  readonly error?: Error;
}

// REVIEVER (data layer)
export interface IRecieverProps<V> {
  onDownChange(): void;
  onGet?(v: V): void;
}

export interface IRecieverBase {
  onDownChanged(): void;
  dispose(): void;
}

export interface IReciever<V = any> extends IRecieverBase {
  readonly downList: Set<IEmitter>;
  readonly isObserving: boolean;
  get(): V;
  // ПОГРУЖАЕМСЯ по графу
  walkDown(): void;
  // ВСПЛЫВАЕМ
  walkUp(): void;
  downAdd(e: IEmitter): void;
}
