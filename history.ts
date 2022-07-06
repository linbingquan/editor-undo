import { isPromise } from "./utils.ts";
import { ICommand } from "./command.ts";

interface IHistoryParams {
  disabled?: boolean;
  usePromiseLock?: boolean;
}

class History {
  private _undos: ICommand[];
  private _redos: ICommand[];
  private _last_time: Date;
  private _idSeed: number;
  private _disabled: boolean;
  private _usePromiseLock: boolean;

  constructor(options?: IHistoryParams) {
    const _options = options || {};
    // 是否禁用 撤销回退功能, 默认是false 不禁用
    const disabled = _options.disabled || false;

    // 使用 promise 编写命令
    const usePromiseLock = _options.usePromiseLock || true;

    this._undos = [];
    this._redos = [];
    this._last_time = new Date();
    this._idSeed = 0;

    /** 是否禁用 */
    this._disabled = disabled;
    /** 是否使用锁 */
    this._usePromiseLock = usePromiseLock;
  }

  /** 提供给外部使用 - 撤销命令列表 */
  get undos() {
    return this._undos;
  }

  /** 提供给外部使用 - 重做命令列表 */
  get redos() {
    return this._redos;
  }

  /** 提供给外部使用 - 是否禁用 */
  get disabled() {
    return this._disabled;
  }

  /** 提供给外部使用 - 设置 是否禁用 */
  set disabled(value) {
    this._disabled = value;
  }

  /**
   * 正向执行方法
   * @param {ICommand} cmd
   * @return {any}
   */
  execute(cmd: ICommand) {
    // 加入重做队列
    this._undos.push(cmd);
    // ID 自增
    cmd.id = ++this._idSeed;
    this._last_time = new Date();

    try {
      const executeFn = cmd.execute();

      // 清空所有的重做命令
      const length = this._redos.length;
      if (length > 0) this._redos.splice(0, length);

      // 返回 execute
      return executeFn;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * 撤销功能
   */
  undo() {
    if (this._disabled) {
      console.warn("editor is disabled");
      return;
    }

    let cmd: ICommand | undefined;

    if (this._undos.length > 0) {
      cmd = this._undos.pop();
    }

    if (!cmd) {
      return;
    }

    const undoFn = cmd.undo();

    if (this._usePromiseLock && isPromise(undoFn)) {
      // 先禁用撤销功能
      this._disabled = true;
      // 加入撤销队列
      if (cmd) this._redos.push(cmd);
      undoFn.catch(() => {
        // 失败 放回重做队列
        if (cmd) this._undos.push(cmd);
      })
        .finally(() => {
          // 最后不禁用撤销功能
          this._disabled = false;
        });
    }

    return undoFn;
  }

  /**
   * 重做功能
   */
  redo() {
    if (this._disabled) {
      console.warn("editor is disabled");
      return;
    }

    let cmd: ICommand | undefined;

    if (this._redos.length > 0) {
      cmd = this._redos.pop();
    }

    if (!cmd) {
      return;
    }

    const executeFn = cmd.execute();

    if (this._usePromiseLock && isPromise(executeFn)) {
      // 先禁用重做功能
      this._disabled = true;
      // 加入重做队列
      if (cmd) this._undos.push(cmd);
      executeFn.catch(() => {
        // 失败 放回撤销队列
        if (cmd) this._redos.push(cmd);
      })
        .finally(() => {
          // 最后不禁用重做功能
          this._disabled = false;
        });
    }

    return executeFn;
  }

  /**
   * 清空撤销重做历史记录
   */
  clear() {
    this._undos.splice(0, this._undos.length);
    this._redos.splice(0, this._redos.length);
    this._idSeed = 0;
  }
}

export { History };
