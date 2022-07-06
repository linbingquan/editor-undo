/** 判断是不是 function 类型 */
export const isFunction = (val: unknown) => typeof val === "function";

/** 判断是不是 object 类型 */
export const isObject = (val: unknown) =>
  val !== null && typeof val === "object";

/** 判断是不是 promise 类型 */
export const isPromise = (val: any) =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch);

/** 是否是苹果系统 */
// export const IS_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
