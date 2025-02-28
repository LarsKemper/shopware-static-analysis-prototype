import { join } from "https://deno.land/std@0.106.0/path/mod.ts";
import { globbyStream } from "globby";
import { ClassDefinition } from "../index.d.ts";
import { OPTIONS } from "./cli.ts";

export function sort(
  classUsage: Map<string, string[]>,
  classDefinitions: Map<string, ClassDefinition>,
  sort: string,
): [string, ClassDefinition][] {
  if (!OPTIONS.sort.includes(sort)) {
    console.warn("Invalid sort key. Use --help for more information.");
    sort = "usage";
  }

  return [...classDefinitions.entries()].sort((a, b) => {
    switch (sort) {
      case "classname":
        return b[0].localeCompare(a[0], undefined, {
          sensitivity: "base",
          numeric: true,
        });

      case "domain": {
        const domainA = classDefinitions.get(a[0])?.domain || "";
        const domainB = classDefinitions.get(b[0])?.domain || "";

        return domainA.localeCompare(domainB, undefined, {
          sensitivity: "base",
          numeric: true,
        });
      }

      case "stability": {
        const classA = classDefinitions.get(a[0]);
        const classB = classDefinitions.get(b[0]);

        if (!classA || !classB) {
          return 0;
        }

        return calculateStabilityRatio(
          classB.imports.length,
          classUsage.get(b[0])?.length || 0,
        ) - calculateStabilityRatio(
          classA.imports.length,
          classUsage.get(a[0])?.length || 0,
        );
      }

      case "usage": {
        return (classUsage.get(b[0])?.length || 0) -
          (classUsage.get(a[0])?.length || 0);
      }

      case "dependencies": {
        return (classDefinitions.get(b[0])?.imports.length || 0) -
          (classDefinitions.get(a[0])?.imports.length || 0);
      }

      default:
        return 0;
    }
  });
}

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
  (by R.C. Martin)

  example for max. stability:
  class 1 -> stable class
  class 2 -> stable class
  class 3 -> stable class

  example for max. instability:
  stable class -> class 1
  stable class -> class 2
  stable class -> class 3
*/
export function calculateStabilityRatio(
  o: number,
  i: number,
): number {
  return o / (i + o);
}
