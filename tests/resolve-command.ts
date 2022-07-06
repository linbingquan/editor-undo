import { Command } from "../command.ts";

const api = () => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

class ResolveCommand extends Command {
  payload?: unknown;
  constructor(payload?: unknown) {
    super();
    this.name = "ResolveCommand";

    if (payload) this.payload = payload;
  }

  execute() {
    return api();
  }

  undo() {
    return api();
  }
}

export { ResolveCommand };
