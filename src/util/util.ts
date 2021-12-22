export const EMPTY_ARRAY: Array<any> = [];
Object.freeze(EMPTY_ARRAY);

export const EMPTY_OBJECT = {};
Object.freeze(EMPTY_OBJECT);

export function isFunction(fn: any): fn is Function {
  return typeof fn === 'function';
}

export function isString(str: any): str is string {
  return typeof str === 'string';
}

export function isObject(obj: any): obj is Object {
  return obj != null && typeof obj === 'object';
}

export function debounce(cb: (...args: Array<any>) => void, wait: number) {
  let timeoutId: any;
  return (...args: Array<any>) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      cb(...args);
    }, wait);
  };
}