import { ClassDefinition } from "./index.d.ts";
import { parseOptions, parser } from "./lib/parser.ts";
import { scanFiles } from "./lib/utils.ts";
import { queryClassDefinitions, queryClassUsages } from "./query/index.ts";
import { renderRenderToString } from "./report/report.tsx";
import { parseArguments, printHelp } from "./lib/cli.ts";
import Spinner from "https://deno.land/x/cli_spinners@v0.0.2/mod.ts";

async function analyze(
  classDefinitions: Map<string, ClassDefinition>,
  classUsages: Map<string, string[]>,
  path: string,
) {
  let fileCount = 0;

  await scanFiles(path, (fullPath, data) => {
    const tree = parser.parse(data, undefined, parseOptions);

    fileCount++;

    queryClassDefinitions(tree, fullPath, classDefinitions);
    queryClassUsages(tree, fullPath, classUsages);
  });

  return fileCount;
}

async function generate(
  classDefinitions: Map<string, ClassDefinition>,
  classUsages: Map<string, string[]>,
  sort: string,
  domains?: string[],
) {
  const reportPath = "./out/sw-architecture-report.html";

  const report = renderRenderToString({
    classUsages,
    classDefinitions,
    domains,
    sortKey: sort,
  });

  await Deno.writeTextFile(reportPath, report);
}

async function main(inputArgs: string[]) {
  const args = parseArguments(inputArgs);

  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  const path: string | null = args.path;

  if (!path) {
    console.error("Please provide a path to scan");
    Deno.exit(1);
  }

  const sort: string = args.sort || "usage";
  const domains: string[] | undefined = args.domains?.split(",") || undefined;

  const classDefinitions = new Map<string, ClassDefinition>();
  const classUsages = new Map<string, string[]>();

  const spinner = Spinner.getInstance();
  await spinner.start(`Analyzing files in ${path}...`);

  try {
    const fileCount = await analyze(
      classDefinitions,
      classUsages,
      path,
    );

    await spinner.succeed(`Analyzed ${fileCount} files, found ${classDefinitions.size} classes`);
    await spinner.start(`Generating report...`);

    await generate(
      classDefinitions,
      classUsages,
      sort,
      domains,
    );

    await spinner.succeed("Report generated");
    Deno.exit(0);
  } catch (error) {
    await spinner.fail("Failed to analyze files");
    console.error(error);
    Deno.exit(1);
  }
}

await main(Deno.args);
