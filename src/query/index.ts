import { classDefinitionQuery, usageQuery } from "./definitions.ts";
import { Tree } from "../lib/parser.ts";
import { ClassDefinition } from "../index.d.ts";

export function queryClassDefinitions(
  tree: Tree,
  path: string,
  classDefinitions: Map<string, ClassDefinition>,
): void {
  const captures = classDefinitionQuery.captures(tree.rootNode);

  const namespace = captures.find((c) => c.name === "namespace")?.node.text ??
    "";
  const className = captures.find((c) => c.name === "classname")?.node.text ??
    "";

  if (!namespace || !className) {
    return;
  }

  const domain = captures.find((c) => c.name === "package")?.node.text ?? "";
  const isInternal = captures.some((c) =>
    c.name === "comment" && c.node.text.includes("@internal")
  );
  const imports = captures.filter((c) => c.name === "type").map((c) =>
    c.node.text
  );

  classDefinitions.set(`${namespace}\\${className}`, {
    isInternal,
    namespace,
    className,
    imports,
    fileName: path,
    domain,
  });
}

export function queryClassUsages(
  tree: Tree,
  path: string,
  classUsages: Map<string, string[]>,
): void {
  const uses = usageQuery.captures(tree.rootNode).map((c) => c.node.text);

  uses.forEach((use) => {
    if (!classUsages.has(use)) {
      classUsages.set(use, []);
    }

    classUsages.get(use)?.push(path);
  });
}
