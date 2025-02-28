import { join } from "https://deno.land/std@0.106.0/path/mod.ts";
import { globbyStream } from "npm:globby";

export async function scanFiles(
  path: string,
  callback: (fullPath: string, data: string) => void,
) {
  const paths = globbyStream([
    "**/*.php",
    "!**/{T,t}est{,s}/**/*.php",
    "!**/node_modules/**/*.php",
    "!**/vendor/**/*.php",
  ], {
    gitignore: true,
    cwd: path,
  });

  for await (const p of paths) {
    const fullPath = join(path, p);
    try {
      const data = await Deno.readTextFile(fullPath);
      callback(fullPath, data);
    } catch (err) {
      console.error(err);
    }
  }
}
