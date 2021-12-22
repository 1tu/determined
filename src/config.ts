export const config = {
  comparer: (a: any, b: any) => a === b,
  debug: true,
  error(...args: Array<any>) {
    console.error(args);
  }
}

export function configure(props: Partial<typeof config>) {
  // return Object.assign(config, props);
}