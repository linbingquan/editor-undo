let text = await Deno.readTextFile("./dist/editor.js");

// remove export
text = text.replaceAll("export", "// export");

await Deno.writeTextFile("./dist/editor.js", text);
