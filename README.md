## 撤销重做模块

> 阅读 mermaid 流程图需要安装 [markdown-preview-enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) 插件

> 从零开始做一个撤销重做模块教程，见 [tutorial](tutorial.md) 教程

### 撤销重做模块功能

- [x] 多实例
- [ ] 持久化
- [ ] 命令运行队列
- [ ] 指定撤销重做步骤数
- [ ] 撤销重做列表的大小控制

#### 事件通知流程图

> 实线：用户主动触发事件 虚线：撤销重新模块的事件响应

```mermaid
sequenceDiagram
  autonumber
  participant user as 用户
  participant eventbus as 事件通知
  participant A as 组件A
  participant B as 组件B

  A -->> A: 实例化 editor <br /> 根据实际情况 注册 keydown 事件
  B -->> B: 实例化 editor <br /> 根据实际情况 注册 keydown 事件
  user ->> A: 进入
  A -->> eventbus: 通知进入
  eventbus -->> B: 通知离开
  B -->> B: 禁用 editor 或者 注销 keydown 事件
  A -->> A: 启动 editor 或者 注册 keydown 事件
  A -->> eventbus: 事件通知 进入组件 A
  eventbus -->> B: 事件通知 不可用
  B -->> B: 禁用 editor 或者 注销 keydown 事件
```

#### 执行流程图

> 实线：用户主动触发 虚线：程序触发

模块说明 撤销命令数组: 存放用户触发的功能

重做命令数组: 存放用户重做的功能（当用户主动出发功能会清空重做命令数组）

从三个阶段说明

阶段 1：A 修改成 B

阶段 2：B 撤销成 A

阶段 3：A 重做成 B

##### 阶段 1：A 修改成 B

```mermaid
sequenceDiagram
  autonumber
  participant user as 用户
  participant component as 组件
  participant undos as 撤销命令数组
  participant redos as 重做命令数组
  participant editor as 编辑器
  participant finish as 结束

  component -->> component: 实例化 editor <br /> 根据实际情况 注册 keydown 事件

  loop 点击功能A
    user ->> component: 点击功能A
    component -->> editor: 执行 editor.execute(new CommandA())
    editor -->> undos: 存放 commandA
    editor -->> redos: 清空 redos 数组 数组长度变为零
    editor -->> component: 返回 commandA.execute 方法
    component -->> component: 链式调用处理业务逻辑
    component -->> finish: 点击流程
  end
```

##### 阶段 2：B 撤销成 A

```mermaid
sequenceDiagram
  autonumber
  participant user as 用户
  participant component as 组件
  participant undos as 撤销命令数组
  participant redos as 重做命令数组
  participant editor as 编辑器
  participant finish as 结束

  user ->> component: 按下键盘的组合键
  component -->> finish: 未匹配到 快捷键
  component -->> editor: 撤销快捷键
  editor -->> finish: 不可用
  editor -->> editor: 可用
  editor -->> undos: 禁用editor <br /> 执行 editor.undo() 方法
  undos -->> undos: 取出 最后一个命令 <br /> 调用 command.undo() 方法
  undos -->> redos: 方法调用成功后 <br /> 存放最后一个命令
  undos -->> undos: 方法调用失败
  undos -->> component: 启用editor <br /> 返回 command.undo() 方法
  redos -->> component: 压栈成功
  component -->> finish: 撤销流程
```

##### 阶段 3：A 重做成 B

```mermaid
sequenceDiagram
  autonumber
  participant user as 用户
  participant component as 组件
  participant undos as 撤销命令数组
  participant redos as 重做命令数组
  participant editor as 编辑器
  participant finish as 结束

  user ->> component: 按下键盘的组合键
  component -->> finish: 未匹配到 快捷键
  component -->> editor: 重做快捷键
  editor -->> finish: 不可用
  editor -->> editor: 可用
  editor -->> redos: 禁用editor <br /> 执行 editor.redo() 方法
  redos -->> redos: 取出 最后一个命令 <br /> 调用 command.execute() 方法
  redos -->> undos: 方法调用成功后 <br /> 存放最后一个命令
  redos -->> redos: 方法调用失败
  undos -->> component: 启用editor <br /> 返回 command.execute() 方法
  redos -->> component: 重新压栈
  component -->> finish: 重做流程
```

#### 实例化 Editor

```javascript
import { Editor } from "./mod.ts";
import { RejectCommand } from "./tests/reject-command.ts";
import { ResolveCommand } from "./tests/resolve-command.ts";

/** 是否是苹果系统，用于判断不同平台的快捷键 */
const IS_MAC = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

/** 快捷键配置 */
const config = {
  "settings/shortcuts/undo": "KeyZ",
  "settings/shortcuts/undo2": "KeyY",
};

/** 实例化 */
const editor = new Editor();

/** 执行 RejectCommand 命令 */
editor.execute(new RejectCommand()); // 示例代码
/** 执行 ResolveCommand 命令 */
editor.execute(new ResolveCommand()); // 示例代码

// 根据实际情况 注册 keydown 事件
window.document.addEventListener("keydown", (event) => {
  const { ctrlKey, shiftKey, metaKey, code } = event;
  switch (code) {
    case config["settings/shortcuts/undo"]:
      if (IS_MAC ? metaKey : ctrlKey) {
        // 注意：阻止默认事件不能放在外面，会阻止浏览器或者input/textarea的默认事件，应该放在相应的按键组合中去阻止
        event.preventDefault();
        if (shiftKey) {
          console.log("ctrl + shift + z 恢复撤销");
          editor.redo();
        } else {
          console.log("ctrl + z 撤销");
          editor.undo();
        }
      }
      break;
    case config["settings/shortcuts/undo2"]:
      if (IS_MAC ? metaKey : ctrlKey) {
        event.preventDefault();
        console.log("ctrl + Y 恢复撤销");
        editor.redo();
      }
      break;
    default:
      break;
  }
  return false;
});

export { editor };
```

#### 禁用编辑器

```javascript
editor.disabled = true;
```

#### 启动编辑器

```javascript
editor.disabled = false;
```

#### 撤销命令数组

```javascript
editor.undos;
```

#### 重做命令数组

```javascript
editor.redos;
```
