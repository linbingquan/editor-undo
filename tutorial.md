### 撤销重做教程

我们从零开始做一下撤销重做模块

首先我们先新建一个 index.html 文件，内容如下

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    // app code
  </body>
</html>
```

- 当我们在应用通过鼠标点击了功能 A
- 我们想撤销回使用之前的状态，我们会按下键盘 `ctrl + z` 来撤销
- 我们想重做功能 A，我们会按下键盘 `ctrl + shift + z` 来重做

在前端我们需要添加一下按键的事件监听, 代码如下

```javascript
// 注册 keydown 事件
document.addEventListener("keydown", (evt) => {
  const { code, ctrlKey, shiftKey } = evt;
  switch (code) {
    case "KeyZ":
      if (ctrlKey) {
        if (shiftKey) {
          console.log("按下了 ctrl + shift + Z");
        } else {
          console.log("按下了 ctrl + Z");
        }
      }
      break;

    default:
      break;
  }
});
```

- 当我们按下 `ctrl + z` 在开发者面板，我们能看见"按下了 ctrl + Z"
- 当我们按下 `ctrl + shift + z` 在开发者面板，我们能看见"按下了 ctrl + shift + z"

此刻我们需要引入两个概念，撤销队列 `undos` (用于存放我们点击的命令)与重做队列 `redos` (用于存放之前撤销过的命令)

我们用一个对象存放 `undos` 与 `redos`，这个对象我们叫它为 `editor` （我们常见的编辑器一般具备撤销重做功能），代码如下

```javascript
class Editor {
  constructor() {
    this.undos = []; // 撤销队列
    this.redos = []; // 重做队列
  }
}
```

我们通过鼠标点击了功能 A，程序会执行(execute)功能 A 的代码。在代码上我们通过 `editor` 执行(execute)功能 A
的代码，`editor` 增加 `execute` 方法，代码如下

```diff
class Editor {
  constructor() {
    this.undos = []; // 撤销队列
    this.redos = []; // 重做队列
  }
+  execute() {}
}
```

点击功能 A 的需要执行的代码统一在 `execute` 方法下，在这里先增加撤销方法 `undo`，后面会用到，代码如下

```javascript
class CommandA {
  execute() {
    // 功能A执行的代码
  }
  undo() {
    // 撤销方法的代码
  }
}
```

接下来我们需要做的事情就是把功能 A 存放到撤销队列 `undos` 用于撤销。修改的代码如下

```diff
class Editor {
  constructor() {
    this.undos = []; // 撤销队列
    this.redos = []; // 重做队列
  }
- execute() {}
+ execute(command) {
+   this.undos.push(command);
+ }
}
```

我们还需要调用 功能A 的 `execute` 方法。修改的代码如下

```diff
class Editor {
  constructor() {
    this.undos = []; // 撤销队列
    this.redos = []; // 重做队列
  }
  execute(command) {
    this.undos.push(command);
+   command.execute();
  }
}
```

当我们调用 功能A 的 `execute` 方法，需要清空 `redos` 撤销队列。修改的代码如下

```diff
class Editor {
  constructor() {
    this.undos = []; // 撤销队列
    this.redos = []; // 重做队列
  }
  execute(command) {
    this.undos.push(command);
    command.execute();
+   const length = this.redos.length;
+   if (length > 0) this.redos.splice(0, length);
  }
}
```

当我们按下撤销快捷键时，我们执行撤销 `undo` 方法

- 在 `undos` 撤销队列取出最近使用的功能，执行功能A `undo` 撤销方法，然后把最近使用的功能存放在 `redos` 重做队列中

添加的代码如下

```diff
class Editor {
  constructor() {
    this.undos = []; // 撤销队列
    this.redos = []; // 重做队列
  }
  execute(command) {
    this.undos.push(command);
    command.execute();
    const length = this.redos.length;
    if (length > 0) this.redos.splice(0, length);
  }
+ undo() {
+   const cmd = this.undos.pop();
+   if (cmd) {
+     cmd.undo();
+     this.redos.push(cmd);
+   }
+ }
}
```

当我们按下重做快捷键时，我们执行重做 `redo` 方法

- 在 `redos` 重做队列取出最近的撤销功能，执行功能A `execute` "重做"方法(相当我们点击功能A方法), 然后把最近使用的功能存放在
  `undos` 撤销队列中

添加的代码如下

```diff
class Editor {
  constructor() {
    this.undos = []; // 撤销队列
    this.redos = []; // 重做队列
  }
  execute(command) {
    this.undos.push(command);
    command.execute();
    const length = this.redos.length;
    if (length > 0) this.redos.splice(0, length);
  }
  undo() {
    const cmd = this.undos.pop();
    if (cmd) {
      cmd.undo();
      this.redos.push(cmd);
    }
  }
+ redo() {
+   const cmd = this.redos.pop();
+   if (cmd) {
+     cmd.execute();
+     this.undos.push(cmd);
+   }
+ }
}
```

最后我们创建一个编辑器，和创建一个功能A，编辑器通过 `execute` 方法直接调用 功能A 代码如下

```javascript
const editor = new Editor();
editor.execute(new CommandA());
```

一个最基础的撤销重做模块我们做完了，完成整代码文件见 tutorial/basic.html 代码如下

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>

  <body>
    <script>
      class Editor {
        constructor() {
          this.undos = [];
          this.redos = [];
        }
        execute(command) {
          this.undos.push(command);
          command.execute();
          const length = this.redos.length;
          if (length > 0) this.redos.splice(0, length);
        }
        undo() {
          const cmd = this.undos.pop();
          if (cmd) {
            cmd.undo();
            this.redos.push(cmd);
          }
        }
        redo() {
          const cmd = this.redos.pop();
          if (cmd) {
            cmd.execute();
            this.undos.push(cmd);
          }
        }
      }

      class CommandA {
        execute() {
          // 功能A执行的代码
          log("执行功能A");
        }
        undo() {
          // 撤销方法的代码
          log("撤销功能A");
        }
      }

      const editor = new Editor();
      editor.execute(new CommandA());

      // 注册 keydown 事件
      document.addEventListener("keydown", (evt) => {
        const { code, ctrlKey, shiftKey } = evt;
        switch (code) {
          case "KeyZ":
            if (ctrlKey) {
              if (shiftKey) {
                editor.redo();
              } else {
                editor.undo();
              }
            }
            break;

          default:
            break;
        }
      });

      function log(str) {
        const div = document.createElement('div');
        div.innerText = str;
        document.body.appendChild(div);
        console.log(str);
      }
    </script>
  </body>
</html>
```

为什么是最基础，因为生产环境下大部是异步执行代码如接口，所以我们还需要实现基于Promise的撤销重做模块

#### 基于Promise的撤销重做模块

我们先弄一个异步函数，代码如下

```javascript
const apiTest = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};
```

功能A执行代码要返回Promise函数，添加的代码如下

```diff
class CommandA {
  execute() {
    // 功能A执行的代码
+   return apiTest();
  }
  undo() {
    // 撤销方法的代码
  }
}
```

Editor.execute 执行方法需要返回Promise函数，提供Promise的链式调用，添加的代码如下

```diff
class Editor {
  // ...
  execute(command) {
    this.undos.push(command);
+   try {
+     const executeFn = command.execute();
      const length = this.redos.length;
      if (length > 0) this.redos.splice(0, length);
+     return executeFn;
+   } catch (err) {
+     throw new Error(err);
+   }
  }
  // ...
}
```

Editor.undo 撤销代码也要返回Promise函数，提供Promise的链式调用，添加的代码如下

```diff
class Editor {
  // ...
  undo() {
+   let cmd;

+   if (this.undos.length > 0) {
+     cmd = this.undos.pop();
+   }

+   if (!cmd) {
+     return;
+   }

+   const undoFn = cmd.undo();
+   undoFn
+     .then(() => {
+       // 成功 加入撤销队列
+       if (cmd) this.redos.push(cmd);
+     })
+     .catch(() => {
+       // 失败 放回重做队列
+       if (cmd) this.undos.push(cmd);
+     })

+   return undoFn;
  }
  // ...
}
```

Editor.redo 重做代码也要返回Promise函数，提供Promise的链式调用，添加的代码如下

```diff
class Editor {
  // ...
  undo() {
+   let cmd;

+   if (this.redos.length > 0) {
+     cmd = this.redos.pop();
+   }

+   if (!cmd) {
+     return;
+   }

+   const executeFn = cmd.execute();

+   executeFn
+     .then(() => {
+       // 成功 加入重做队列
+       if (cmd) this.undos.push(cmd);
+     })
+     .catch(() => {
+       // 失败 放回撤销队列
+       if (cmd) this.redos.push(cmd);
+     })

+   return executeFn;
  }
  // ...
}
```

我们这个时候需要一下禁用的标志位 `disabled` 表示是否为禁用，代码增加如下：

```diff
class Editor {
  constructor() {
    //...
+   this.disable = false;
    //...
  }

}
```

撤销方法代码为了支持 `disable` 属性，代码修改如下

```diff
class Editor {
  // ...
  undo() {
+   if (this.disabled) {
+     return;
+   }

    let cmd;

    if (this.undos.length > 0) {
      cmd = this.undos.pop();
    }

    if (!cmd) {
      return;
    }

+   // 先禁用撤销功能
+   this.disabled = true;

    const undoFn = cmd.undo();
    undoFn
      .then(() => {
        // 成功 加入撤销队列
        if (cmd) this.redos.push(cmd);
      })
      .catch(() => {
        // 失败 放回重做队列
        if (cmd) this.undos.push(cmd);
      })
+     .finally(() => {
+       // 最后不禁用撤销功能
+       this.disabled = false;
+     });

    // ...
  }
  // ...
}
```

撤销方法代码为了支持 `disable` 属性，代码修改如下

```diff
class Editor {
  // ...
  redo() {
+   if (this.disabled) {
+     return;
+   }

    let cmd;

    if (this.redos.length > 0) {
      cmd = this.redos.pop();
    }

    if (!cmd) {
      return;
    }

+   // 先禁用撤销功能
+   this.disabled = true;

    executeFn
      .then(() => {
        // 成功 加入重做队列
        if (cmd) this.undos.push(cmd);
      })
      .catch(() => {
        // 失败 放回撤销队列
        if (cmd) this.redos.push(cmd);
      })
+     .finally(() => {
+       // 最后不禁用重做功能
+       this.disabled = false;
+     });
    // ...
  }
  // ...
}
```

至此基于 Promise 的改造已经完成，示例代码可运行 tutorial/promise.html 文件 代码如下

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>

  <body>
    <script>
      const apiTest = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 500);
        });
      };

      class Editor {
        constructor() {
          this.undos = [];
          this.redos = [];
          this.disabled = false;
        }
        execute(command) {
          this.undos.push(command);

          try {
            const executeFn = command.execute();
            const length = this.redos.length;
            if (length > 0) this.redos.splice(0, length);
            // 返回 execute
            return executeFn;
          } catch (err) {
            throw err;
          }
        }
        undo() {
          if (this.disabled) {
            console.warn("editor is disabled");
            return;
          }
          let cmd;

          if (this.undos.length > 0) {
            cmd = this.undos.pop();
          }

          if (!cmd) {
            return;
          }

          // 先禁用撤销功能
          this.disabled = true;

          const undoFn = cmd.undo();
          undoFn
            .then(() => {
              // 成功 加入撤销队列
              if (cmd) this.redos.push(cmd);
            })
            .catch(() => {
              // 失败 放回重做队列
              if (cmd) this.undos.push(cmd);
            })
            .finally(() => {
              // 最后不禁用撤销功能
              this.disabled = false;
            });

          return undoFn;
        }
        redo() {
          if (this.disabled) {
            console.warn("editor is disabled");
            return;
          }
          let cmd;

          if (this.redos.length > 0) {
            cmd = this.redos.pop();
          }

          if (!cmd) {
            return;
          }

          // 先禁用撤销功能
          this.disabled = true;

          const executeFn = cmd.execute();

          executeFn
            .then(() => {
              // 成功 加入重做队列
              if (cmd) this.undos.push(cmd);
            })
            .catch(() => {
              // 失败 放回撤销队列
              if (cmd) this.redos.push(cmd);
            })
            .finally(() => {
              // 最后不禁用撤销功能
              this.disabled = false;
            });

          return executeFn;
        }
      }

      class CommandA {
        execute() {
          // 功能A执行的代码
          log("执行功能A");
          return apiTest()
        }
        undo() {
          // 撤销方法的代码
          log('撤销功能A');
          return apiTest()
        }
      }

      const editor = new Editor();
      editor.execute(new CommandA());

      // 注册 keydown 事件
      document.addEventListener('keydown', evt => {
        const { code, ctrlKey, shiftKey } = evt;
        switch (code) {
          case 'KeyZ':
            if (ctrlKey) {
              if (shiftKey) {
                editor.redo();
              } else {
                editor.undo();
              }
            }
            break;

          default:
            break;
        }
      });

      function log(str) {
        const div = document.createElement('div');
        div.innerText = str;
        document.body.appendChild(div);
        console.log(str);
      }
    </script>
  </body>
</html>
```

#### 总结

撤销重做模块主要做了一件事情就是维护撤销重做两个队列，如果用户做了新操作就会清空重做的队列。 功能命令模块需要继承 `Command` 类，使用 Promise
来实现 `execute` `undo` 两个方法，并返回此 promise 方法提供给 `editor` 做链式调用。

#### todos 应用

[todos-vue2](examples/todos-vue2.html)

[todos-vue3](examples/todos-vue3.html)
