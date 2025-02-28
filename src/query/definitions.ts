import { Query } from "tree-sitter";
import { phpLang } from "../lib/parser.ts";

export const useQuery = new Query(
  phpLang,
  `(qualified_name) @type`,
);

export const classDefinitionQuery = new Query(
  phpLang,
  `
  (
    (namespace_definition
      name: (namespace_name) @namespace
    )
    (comment)? @comment
    (class_declaration 
      attributes: 
        (attribute_list
          (attribute_group 
            (attribute (name) @name
              (#eq? @name "Package")
              parameters:
              (arguments 
                (argument 
                  (string
                    (string_content) @package
                  )
                )
              )
            )
          )
        )
      name: (name) @classname
    )
  )
  `,
);
