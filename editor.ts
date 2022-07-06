import { ICommand } from "./command.ts";
import { History } from "./history.ts";

class Editor {
  history: History;

  constructor() {
    this.history = new History();
  }

  /** 撤销命令列表 */
  get undos() {
    return this.history.undos;
  }

  /** 重做命令列表 */
  get redos() {
    return this.history.redos;
  }

  /** 是否禁用 */
  get disabled() {
    return this.history.disabled;
  }

  /** 设置 是否禁用 */
  set disabled(value) {
    this.history.disabled = value;
  }

  /**
   * 执行函数 正向的重做方式
   * @param {ICommand} cmd 撤销重做指令对象
   * @returns {Promise<unknown> | void}
   */
  execute(cmd: ICommand) {
    return this.history.execute(cmd);
  }

  /**
   * 撤销功能
   */
  undo() {
    return this.history.undo();
  }

  /**
   * 重做功能
   */
  redo() {
    return this.history.redo();
  }

  /**
   * 清空撤销重做
   */
  clear() {
    this.history.clear();
  }
}

export { Editor };
