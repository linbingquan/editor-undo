// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class Command {
    id;
    name;
    constructor(){
        this.id = 0;
        this.name = "";
    }
}
const isFunction = (val)=>typeof val === "function";
const isObject = (val)=>val !== null && typeof val === "object";
const isPromise = (val)=>isObject(val) && isFunction(val.then) && isFunction(val.catch);
class History {
    _undos;
    _redos;
    _last_time;
    _idSeed;
    _disabled;
    _usePromiseLock;
    constructor(options){
        const _options = options || {};
        const disabled = _options.disabled || false;
        const usePromiseLock = _options.usePromiseLock || true;
        this._undos = [];
        this._redos = [];
        this._last_time = new Date();
        this._idSeed = 0;
        this._disabled = disabled;
        this._usePromiseLock = usePromiseLock;
    }
    get undos() {
        return this._undos;
    }
    get redos() {
        return this._redos;
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    execute(cmd) {
        this._undos.push(cmd);
        cmd.id = ++this._idSeed;
        this._last_time = new Date();
        try {
            const executeFn = cmd.execute();
            const length = this._redos.length;
            if (length > 0) this._redos.splice(0, length);
            return executeFn;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    undo() {
        if (this._disabled) {
            console.warn("editor is disabled");
            return;
        }
        let cmd;
        if (this._undos.length > 0) {
            cmd = this._undos.pop();
        }
        if (!cmd) {
            return;
        }
        const undoFn = cmd.undo();
        if (this._usePromiseLock && isPromise(undoFn)) {
            this._disabled = true;
            if (cmd) this._redos.push(cmd);
            undoFn.catch(()=>{
                if (cmd) this._undos.push(cmd);
            }).finally(()=>{
                this._disabled = false;
            });
        }
        return undoFn;
    }
    redo() {
        if (this._disabled) {
            console.warn("editor is disabled");
            return;
        }
        let cmd;
        if (this._redos.length > 0) {
            cmd = this._redos.pop();
        }
        if (!cmd) {
            return;
        }
        const executeFn = cmd.execute();
        if (this._usePromiseLock && isPromise(executeFn)) {
            this._disabled = true;
            if (cmd) this._undos.push(cmd);
            executeFn.catch(()=>{
                if (cmd) this._redos.push(cmd);
            }).finally(()=>{
                this._disabled = false;
            });
        }
        return executeFn;
    }
    clear() {
        this._undos.splice(0, this._undos.length);
        this._redos.splice(0, this._redos.length);
        this._idSeed = 0;
    }
}
class Editor {
    history;
    constructor(){
        this.history = new History();
    }
    get undos() {
        return this.history.undos;
    }
    get redos() {
        return this.history.redos;
    }
    get disabled() {
        return this.history.disabled;
    }
    set disabled(value) {
        this.history.disabled = value;
    }
    execute(cmd) {
        return this.history.execute(cmd);
    }
    undo() {
        return this.history.undo();
    }
    redo() {
        return this.history.redo();
    }
    clear() {
        this.history.clear();
    }
}
export { Command as Command };
export { Editor as Editor };
