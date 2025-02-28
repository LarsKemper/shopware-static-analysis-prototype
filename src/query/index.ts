import { classDefinitionQuery, usageQuery } from "./definitions.ts";
import { Tree } from "../lib/parser.ts";
import { ClassDefinition } from "../index.d.ts";

export function queryClassDefinitions(
  tree: Tree,
  path: string,
  classDefinitions: Map<string, ClassDefinition>,
): void {
  const defQueryCaptures = classDefinitionQuery.captures(tree.rootNode);

  const comments = defQueryCaptures.filter((c) => c.name === "comment");
  const isInternal = comments.some((c) => c.node.text.includes("@internal"));
  const namespace =
    defQueryCaptures.find((c) => c.name === "namespace")?.node.text ?? "";
  const className =
    defQueryCaptures.find((c) => c.name === "classname")?.node.text ?? "";
  const packageDomain =
    defQueryCaptures.find((c) => c.name === "package")?.node.text ?? "";
  const imports = defQueryCaptures.filter((c) => c.name === "type").map((c) =>
    c.node.text
  );

  if (!namespace || !className) {
    return;
  }

  classDefinitions.set(`${namespace}\\${className}`, {
    isInternal,
    namespace,
    className,
    imports,
    fileName: path,
    domain: packageDomain,
  });
}

export function queryClassUsages(
  tree: Tree,
  path: string,
  classUsages: Map<string, string[]>,
): void {
  const queryCaptures = usageQuery.captures(tree.rootNode);
  const uses = queryCaptures.map((c) => c.node.text);

  uses.forEach((u) => {
    if (!classUsages.has(u)) {
      classUsages.set(u, []);
    }

    classUsages.get(u)?.push(path);
  });
}
