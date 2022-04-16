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

export interface IEmitterBase {
  downChanged(): void;
}

export interface IEmitter<P extends IEmitterProps = IEmitterProps> extends IEmitterBase {
  state: EEmitterState;
  readonly upList: Set<IRecieverBase>;
  readonly isObserving: boolean;
  readonly props: P;
  // return isChanged
  actualize(skipLink?: boolean): boolean;
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
  readonly cache_: V;
  get(): V;
  set(lv: ILambdaValue<V>): void;
}

export interface IValueProps<V> extends IValueBaseProps<V> {
}

export interface IValue<V = any> extends IValueBase<V, IValueProps<V>> {
  readonly error?: Error;
  getPrev(): V;
  set(lv: ILambda<V>): void;
}

// REVIEVER (data layer)
export interface IRecieverProps<V> {
  onDownChange?(): void;
  onGet?(v: V): void;
}

export interface IRecieverBase {
  onDownChanged(): void;
}

export interface IReciever<V = any> extends IRecieverBase {
  readonly downList: Set<IEmitter>;
  // получить новое значение, может выбросить VALUE_NOT_CHANGED
  get(): V;
  // ПОГРУЖАЕМСЯ по графу
  walkDown(): void;
  // ВСПЛЫВАЕМ
  walkUp(): void;
  downAdd(e: IEmitter): void;
}

export enum EEngineJob {
  Unlink,
  Link,
}