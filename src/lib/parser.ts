import TreeSitterPhp from "tree-sitter-php";
import Parser, { Language } from "tree-sitter";

export const parseOptions = {
  bufferSize: 1024 * 1024,
};

export const phpLang = TreeSitterPhp.php as Language;
export const parser = new Parser();
parser.setLanguage(phpLang);

export type Tree = Parser.Tree;
