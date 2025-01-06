// Functions to modify the Lucene AST

import type { Node, NodeTerm, AST } from "lucene";
import { isNodeTerm, isAST, isBinaryAST } from "$lib/utils/search";

/**
 * Add a new term to the AST.
 */
export function addTerm(ast: AST, field: string, value: string): AST {
  // Create a new term node
  const term: NodeTerm = {
    field,
    term: value,
    boost: null,
    prefix: null,
    quoted: false,
    regex: false,
    similarity: null,
    fieldLocation: null,
    termLocation: {
      start: { column: 0, line: 0, offset: 0 },
      end: { column: 0, line: 0, offset: 0 },
    },
  };

  // Clone the AST for immutability
  const newAst = Object.assign({}, ast);

  // Create a new parent node
  const newParent: AST = {
    left: newAst,
    operator: "<implicit>",
    right: term,
  };

  return newParent;
}

/**
 * Remove a term from the AST.
 */
export function removeTerm(ast: AST, field: string, value?: string): AST {
  // Clone the AST for immutability
  const newAst = Object.assign({}, ast);

  // Traverse the tree looking for a match
  function traverse(ast: AST | Node): AST | null {
    // If the node is a leaf, check if it matches the term
    if (
      isNodeTerm(ast) &&
      ast.field === field &&
      (!value || ast.term === value)
    ) {
      // When you find a match, remove it from its parent
      // The term node will always be a leaf, remove without worrying about its children
      return null;
    }
    let newLeft, newRight;
    // If the node is a parent, traverse its children
    if (isAST(ast) && ast.left) {
      newLeft = traverse(ast.left);
    }
    if (isBinaryAST(ast) && ast.right) {
      newRight = traverse(ast.right);
    }
    // If the node is a parent and both children are null, remove it
    if (isAST(ast) && !newLeft && !newRight) {
      return null;
    }

    // Finally, return the code with the new children. If a branch is missing, make the node a leaf.
    return {
      left: newLeft || ast.left,
      operator: ast.operator,
      right: newRight || ast,
    };
  }

  return traverse(newAst) as AST;
}
