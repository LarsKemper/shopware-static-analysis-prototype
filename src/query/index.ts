import { classDefinitionQuery, useQuery } from "./definitions.ts";
import { Tree } from "../lib/parser.ts";
import { ClassDefinition } from "../index.d.ts";

export function queryClassDefinitions(
  tree: Tree,
  path: string,
  classDefinitions: Map<string, ClassDefinition>,
): void {
  const queryCaptures = classDefinitionQuery.captures(tree.rootNode);

  const comments = queryCaptures.filter((c) => c.name === "comment");
  const isInternal = comments.some((c) => c.node.text.includes("@internal"));
  const namespace = queryCaptures.find((c) => c.name === "namespace")?.node
    ?.text;
  const className = queryCaptures.find((c) => c.name === "classname")?.node
    ?.text;
  const package_domain = queryCaptures.find((c) => c.name === "package")?.node
    ?.text;

  if (!namespace || !className) {
    return;
  }

  classDefinitions.set(`${namespace}\\${className}`, {
    isInternal,
    namespace,
    className,
    fileName: path,
    domain: package_domain,
  });
}

export function queryClassUsages(
  tree: Tree,
  path: string,
  classUsages: Map<string, string[]>,
): void {
  const queryCaptures = useQuery.captures(tree.rootNode);
  const uses = queryCaptures.map((c) => c.node.text);

  uses.forEach((u) => {
    if (!classUsages.has(u)) {
      classUsages.set(u, []);
    }

    classUsages.get(u)?.push(path);
  });
}
