import { join } from "https://deno.land/std@0.106.0/path/mod.ts";
import { globbyStream } from "globby";

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
    if (typeof p !== "string") {
      continue;
    }

    const fullPath = join(path, p);

    try {
      const data = await Deno.readTextFile(fullPath);
      callback(fullPath, data);
    } catch (err) {
      console.error(err);
    }
  }
}

/*
  formula: s = o / (i + o)
  s = stability ratio: 0 = max. stability, 1 = max. instability
  o = output range: number of class imports
  i = input range: number of classes that import the class

  example for max. stability:
  class 1 -> stable class
  class 2 -> stable class
  class 3 -> stable class

  example for max. instability:
  stable class -> class 1
  stable class -> class 2
  stable class -> class 3
*/
export function calculateStabilityRatio(o: number, i: number, decimals = 2): string {
  return ((o / (i + o)).toFixed(decimals));
}
