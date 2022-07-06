import { Command } from "../command.ts";

const api = () => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("reject"));
    }, 500);
  });
};

class RejectCommand extends Command {
  payload?: unknown;
  constructor(payload?: unknown) {
    super();
    this.name = "RejectCommand";

    if (payload) this.payload = payload;
  }

  execute() {
    return api();
  }

  undo() {
    return api();
  }
}

export { RejectCommand };
