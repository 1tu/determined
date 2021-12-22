import { config } from '../config';

export function log(...args: Array<any>) {
  if (!config.debug) return;
  console.log(args);
}
