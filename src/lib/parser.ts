import TreeSitterPhp from "npm:tree-sitter-php@0.23.12";
import Parser, { Language } from "npm:tree-sitter@0.22.4";

export const parseOptions = {
  bufferSize: 1024 * 1024,
};

export const phpLang = TreeSitterPhp.php as Language;
export const parser = new Parser();
parser.setLanguage(phpLang);

export type Tree = Parser.Tree;
