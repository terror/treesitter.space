import { EditorState } from '@codemirror/state';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Language, Parser, Tree } from 'web-tree-sitter';

import { Position, SyntaxNode, TreeNodeInfo } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createNodePositionMap = (
  formattedTree: TreeNodeInfo[],
  doc: EditorState['doc']
): Map<SyntaxNode, Position> => {
  const nodeMap = new Map<SyntaxNode, Position>();

  formattedTree.forEach((item) => {
    const from = positionToOffset(item.node.startPosition, doc);
    const to = positionToOffset(item.node.endPosition, doc);

    if (from !== null && to !== null) {
      nodeMap.set(item.node, { start: from, end: to });
    }
  });

  return nodeMap;
};

export const createNodeToParentMap = (
  formattedTree: TreeNodeInfo[]
): Map<SyntaxNode, SyntaxNode> => {
  const nodeToParentMap = new Map<SyntaxNode, SyntaxNode>();

  for (let i = 1; i < formattedTree.length; i++) {
    const currentNode = formattedTree[i].node;
    const currentLevel = formattedTree[i].level;

    for (let j = i - 1; j >= 0; j--) {
      const potentialParent = formattedTree[j].node;
      const potentialParentLevel = formattedTree[j].level;

      if (potentialParentLevel < currentLevel) {
        nodeToParentMap.set(currentNode, potentialParent);
        break;
      }
    }
  }

  return nodeToParentMap;
};

export const formatTree = (
  node: SyntaxNode,
  indent = 0,
  _isLast = true
): TreeNodeInfo[] => {
  const nodeInfo = {
    text: `${node.type} [${node.startPosition.row},${node.startPosition.column}]`,
    node,
    level: indent,
    type: node.type,
  };

  const result = [nodeInfo];

  const childCount = node.childCount;

  if (childCount > 0) {
    node.children.forEach((child: SyntaxNode, index: number) => {
      const childResult = formatTree(
        child,
        indent + 1,
        index === childCount - 1
      );

      result.push(...childResult);
    });
  }

  return result;
};

export const getVisibleNodes = (
  formattedTree: TreeNodeInfo[],
  expandedNodes: Set<SyntaxNode>
): TreeNodeInfo[] => {
  if (formattedTree.length === 0) return [];

  const nodeToParentMap = createNodeToParentMap(formattedTree);

  return formattedTree.filter((item) => {
    if (item.level === 0) return true;

    let currentNode = item.node;
    let isVisible = true;

    while (nodeToParentMap.has(currentNode)) {
      const parent = nodeToParentMap.get(currentNode)!;

      if (!expandedNodes.has(parent)) {
        isVisible = false;
        break;
      }

      currentNode = parent;
    }

    return isVisible;
  });
};

export const parseCode = (
  parser: Parser,
  lang: Language,
  code: string
): Tree | null => {
  parser.setLanguage(lang);
  return parser.parse(code);
};

export const positionToOffset = (
  position: { row: number; column: number },
  doc: EditorState['doc']
): number | null => {
  const lineNumber = position.row + 1;

  if (lineNumber > doc.lines) return null;

  const lineStartPos = doc.line(lineNumber).from;
  const columnPos = Math.min(position.column, doc.line(lineNumber).length);

  return lineStartPos + columnPos;
};

export const processTree = (
  tree: Tree,
  doc: EditorState['doc']
): {
  formattedTree: TreeNodeInfo[];
  nodePositionMap: Map<SyntaxNode, Position>;
  allNodes: Set<SyntaxNode>;
} => {
  const formattedTree = formatTree(tree.rootNode as unknown as SyntaxNode);
  const nodePositionMap = createNodePositionMap(formattedTree, doc);

  const allNodes = new Set<SyntaxNode>();
  formattedTree.forEach((item) => allNodes.add(item.node));

  return {
    allNodes,
    formattedTree,
    nodePositionMap,
  };
};
