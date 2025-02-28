import { ClassDefinition } from "./index.d.ts";
import { parseOptions, parser } from "./lib/parser.ts";
import { scanFiles } from "./lib/utils.ts";
import { queryClassDefinitions, queryClassUsages } from "./query/index.ts";
import { renderRenderToString } from "./report/report.tsx";
import { parseArguments, printHelp } from "./lib/cli.ts";

async function analyze(
  classDefinitions: Map<string, ClassDefinition>,
  classUsages: Map<string, string[]>,
  path: string,
) {
  let fileCount = 0;

  await scanFiles(path, (fullPath, data) => {
    try {
      const tree = parser.parse(data, undefined, parseOptions);

      fileCount++;

      queryClassDefinitions(tree, fullPath, classDefinitions);
      queryClassUsages(tree, fullPath, classUsages);
    } catch (err) {
      console.error(`Error scanning file: ${fullPath}`, err);
      Deno.exit(1);
    }
  });

  return fileCount;
}

function generate(
  classDefinitions: Map<string, ClassDefinition>,
  classUsages: Map<string, string[]>,
  sort: string,
  domains?: string[],
) {
  try {
    const reportPath = "./out/sw-architecture-report.html";
    const report = renderRenderToString({
      classUsages,
      classDefinitions,
      domains,
      sortKey: sort,
    });

    Deno.writeTextFileSync(reportPath, report);
    console.log("HTML report written to", reportPath);
    Deno.exit(0);
  } catch (err) {
    console.error(err);
    Deno.exit(1);
  }
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

  console.log(`Scanning path: ${path}`);
  console.log("Scanning... This may take a while");

  const fileCount = await analyze(
    classDefinitions,
    classUsages,
    path,
  );

  console.log("scanned files:", fileCount);
  console.log("found classes:", classDefinitions.size);
  console.log("found class usages:", classUsages.size);

  generate(
    classDefinitions,
    classUsages,
    sort,
    domains,
  );
}

await main(Deno.args);
