// eslint-disable-next-line @typescript-eslint/no-this-alias
let globalThisShim = eval('this');
let globalShim = globalThisShim;
export { globalThisShim as globalThis, globalShim as global };
