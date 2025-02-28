import { parse } from "https://deno.land/std@0.200.0/flags/mod.ts";
import type { Args } from "https://deno.land/std@0.200.0/flags/mod.ts";

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

  return parse(args, {
    alias,
    boolean: booleanArgs,
    string: stringArgs,
    stopEarly: false,
    "--": true,
  });
}

export function printHelp(): void {
  console.log(`Usage: swag-sa --path [path] [OPTIONS...]`);
  console.log("\nOptional flags:");
  console.log("  -h, --help                Display this help and exit");
  console.log("  -s, --sort                Set the sorting key for the report");
  console.log(
    "  -d, --domains             Set the domains to filter the report",
  );
}
