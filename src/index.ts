import { ClassDefinition } from "./index.d.ts";
import { parseOptions, parser } from "./lib/parser.ts";
import { scanFiles } from "./lib/utils.ts";
import { queryClassDefinitions, queryClassUsages } from "./query/index.ts";
import { getReport } from "./report/index.ts";

const classUsages = new Map<string, string[]>();

const classDefinitions = new Map<string, ClassDefinition>();

const pathToScan = Deno.args[0];

if (!pathToScan) {
  console.error("Please provide a path to scan");
  Deno.exit(1);
}

console.log(`Scanning path: ${pathToScan}`);
console.log("Scanning... This may take a while");

let filesScanned = 0;
await scanFiles(pathToScan, (fullPath, data) => {
  try {
    const tree = parser.parse(data, undefined, parseOptions);

    filesScanned++;

    queryClassDefinitions(tree, fullPath, classDefinitions);
    queryClassUsages(tree, fullPath, classUsages);
  } catch (err) {
    console.error(`Error scanning file: ${fullPath}`, err);
    Deno.exit(1);
  }
});

console.log("scanned files:", filesScanned);
console.log("found classes:", classDefinitions.size);
console.log("found class usages:", classUsages.size);

try {
  const reportPath = "./out/sw-architecture-report.html";
  const report = getReport(classUsages, classDefinitions);

  Deno.writeTextFileSync(reportPath, report);
  console.log("HTML report written to", reportPath);
} catch (err) {
  console.error(err);
}
