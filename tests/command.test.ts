import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std/testing/asserts.ts";
import { Editor } from "../mod.ts";
import { RejectCommand } from "./reject-command.ts";
import { ResolveCommand } from "./resolve-command.ts";

Deno.test("ResolveCommand", async () => {
  /** 初始化 */
  const editor = new Editor();
  assertEquals(editor.undos.length, 0);
  assertEquals(editor.redos.length, 0);

  /** ResolveCommand 命令 */
  await editor.execute(new ResolveCommand());
  assertEquals(editor.undos.length, 1);
  assertEquals(editor.redos.length, 0);

  /** 撤销 */
  await editor.undo();
  assertEquals(editor.undos.length, 0);
  assertEquals(editor.redos.length, 1);

  /** 重做 */
  await editor.redo();
  assertEquals(editor.undos.length, 0);
  assertEquals(editor.redos.length, 1);
});

Deno.test("RejectCommand", async () => {
  /** 初始化 */
  const editor = new Editor();
  assertEquals(editor.undos.length, 0);
  assertEquals(editor.redos.length, 0);

  /** RejectCommand 命令 */
  await assertRejects(
    async () => await editor.execute(new RejectCommand()),
    Error,
    "reject",
  );

  assertEquals(editor.undos.length, 1);
  assertEquals(editor.redos.length, 0);
});
