import { ClassDefinition } from "./index.d.ts";
import { parseOptions, parser } from "./lib/parser.ts";
import { scanFiles } from "./lib/utils.ts";
import { queryClassDefinitions, queryClassUsages } from "./query/index.ts";
import { renderRenderToString } from "./report/report.tsx";
import { parseArguments, printHelp } from "./lib/cli.ts";
import Spinner from "https://deno.land/x/cli_spinners@v0.0.2/mod.ts";

async function analyzeFiles(
  path: string,
  classDefinitions: Map<string, ClassDefinition>,
  classUsages: Map<string, string[]>,
): Promise<number> {
  let fileCount = 0;

  await scanFiles(path, (fullPath, data) => {
    const tree = parser.parse(data, undefined, parseOptions);
    fileCount++;

    queryClassDefinitions(tree, fullPath, classDefinitions);
    queryClassUsages(tree, fullPath, classUsages);
  });

  return fileCount;
}

async function generateReport(
  classDefinitions: Map<string, ClassDefinition>,
  classUsages: Map<string, string[]>,
  sort: string,
  domains?: string[],
): Promise<string> {
  const reportPath = "./out/sw-architecture-report.html";
  const reportContent = renderRenderToString({
    classUsages,
    classDefinitions,
    domains,
    sortKey: sort,
  });

  await Deno.writeTextFile(reportPath, reportContent);

  return Deno.realPath(reportPath);
}

async function main(inputArgs: string[]): Promise<void> {
  const args = parseArguments(inputArgs);

  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  const path = args.path;

  if (!path) {
    console.error("Error: Please provide a path to scan");
    Deno.exit(1);
  }

  const sort = args.sort || "usage";
  const domains = args.domains?.split(",");

  const classDefinitions = new Map<string, ClassDefinition>();
  const classUsages = new Map<string, string[]>();

  const spinner = Spinner.getInstance();

  try {
    await spinner.start(`Analyzing files in ${path}...`);
    const startTime = performance.now();

    const fileCount = await analyzeFiles(path, classDefinitions, classUsages);

    const duration = Math.round(performance.now() - startTime);
    await spinner.succeed(
      `Analyzed ${fileCount} files, found ${classDefinitions.size} classes in ${duration}ms`,
    );

    await spinner.start("Generating report...");
    const reportPath = await generateReport(
      classDefinitions,
      classUsages,
      sort,
      domains,
    );
    await spinner.succeed(`Report generated: ${reportPath}`);

    Deno.exit(0);
  } catch (error) {
    await spinner.fail("Error during analysis");
    console.error(error);
    Deno.exit(1);
  }
}

await main(Deno.args);
