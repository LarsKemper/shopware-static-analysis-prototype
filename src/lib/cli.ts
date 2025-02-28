import { parse } from "https://deno.land/std@0.200.0/flags/mod.ts";
import type { Args } from "https://deno.land/std@0.200.0/flags/mod.ts";

export const OPTIONS = {
  sort: ["classname", "domain", "stability", "usage", "dependencies"],
};

export function parseArguments(args: string[]): Args {
  const booleanArgs = [
    "help",
  ];

  const stringArgs = [
    "path",
    "sort",
    "domains",
  ];

  const alias = {
    "help": "h",
    "path": "p",
    "sort": "s",
    "domains": "d",
  };

  const defaults = {
    sort: "usage",
  };

  return parse(args, {
    alias,
    boolean: booleanArgs,
    string: stringArgs,
    default: defaults,
    stopEarly: false,
    "--": true,
  });
}

export function printHelp(): void {
  console.log(`Usage: swag-ar --path [path] [OPTIONS...]\n`);
  console.log("Optional flags:");
  console.log("  -h, --help      Display this help and exit");
  console.log(
    `  -s, --sort      Set the sorting key for the report (options: ${
      OPTIONS.sort.join(", ")
    }) [default: usage]`,
  );
  console.log(
    "  -d, --domains   Set the domains to filter the report",
  );
}
