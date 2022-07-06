import { Editor } from "./editor.ts";

interface ICommand {
  id: number;
  name?: string;
  editor?: Editor;
  execute: () => Promise<unknown>;
  undo: () => Promise<unknown>;
}

class Command {
  id: number;
  name: string;
  constructor() {
    this.id = 0;
    this.name = "";
  }
}

export { Command };
export type { ICommand };
