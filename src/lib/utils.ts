import { EditorState, Extension } from '@codemirror/state';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Language, Parser, Tree } from 'web-tree-sitter';

import { NodePosition, SyntaxNode, TreeNodeInfo } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a syntax tree into a flat array of node information for display
 *
 * @param node - The root syntax node to format
 * @param indent - The indentation level (default: 0)
 * @param _isLast - Whether this node is the last child of its parent (default: true)
 * @returns Array of node information objects with text, original node, level, and type
 */
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

/**
 * Creates a map from syntax nodes to their parent nodes based on a flat tree representation
 *
 * @param formattedTree - The flat array of tree node information
 * @returns A Map where keys are child nodes and values are their parent nodes
 */
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

/**
 * Filters tree nodes based on expansion state, returning only visible nodes
 *
 * @param formattedTree - The flat array of tree node information
 * @param expandedNodes - Set of nodes that are currently expanded
 * @returns Array of tree node information that should be visible
 */
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

/**
 * Converts a tree-sitter position to a CodeMirror document offset
 *
 * @param position - The tree-sitter position with row and column
 * @param doc - The CodeMirror document
 * @returns The corresponding offset in the document, or null if invalid
 */
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

/**
 * Creates a map from syntax nodes to their positions in the editor
 *
 * @param formattedTree - The flat array of tree node information
 * @param doc - The CodeMirror document
 * @returns A Map where keys are nodes and values are their positions in the document
 */
export const createNodePositionMap = (
  formattedTree: TreeNodeInfo[],
  doc: EditorState['doc']
): Map<SyntaxNode, NodePosition> => {
  const nodeMap = new Map<SyntaxNode, NodePosition>();

  formattedTree.forEach((item) => {
    const from = positionToOffset(item.node.startPosition, doc);
    const to = positionToOffset(item.node.endPosition, doc);

    if (from !== null && to !== null) {
      nodeMap.set(item.node, { from, to });
    }
  });

  return nodeMap;
};

/**
 * Creates an initial EditorState with configured extensions
 *
 * @param initialText - The initial text to display in the editor
 * @param extensions - Array of CodeMirror extensions to apply
 * @returns A configured EditorState
 */
export const createEditorState = (
  initialText: string,
  extensions: Extension[]
): EditorState => {
  return EditorState.create({
    doc: initialText,
    extensions,
  });
};

/**
 * Initializes the Tree-sitter parser
 *
 * @returns A Promise that resolves to a new Parser instance
 * @throws Error if parser initialization fails
 */
export const initializeParser = async (): Promise<Parser> => {
  await Parser.init({
    locateFile(scriptName: string, _scriptDirectory: string) {
      return scriptName;
    },
  });

  return new Parser();
};

/**
 * Loads a language for the Tree-sitter parser
 *
 * @param langName - The name of the language to load
 * @param wasmPath - Path to the WebAssembly file for the language
 * @returns A Promise that resolves to the loaded Language
 */
export const loadLanguage = async (
  _langName: string,
  wasmPath: string
): Promise<Language> => {
  return await Language.load(wasmPath);
};

/**
 * Parses code with a configured parser
 *
 * @param parser - The Tree-sitter parser instance
 * @param lang - The loaded language for parsing
 * @param code - The code to parse
 * @returns The parsed syntax tree
 */
export const parseCode = (
  parser: Parser,
  lang: Language,
  code: string
): Tree | null => {
  parser.setLanguage(lang);
  return parser.parse(code);
};

/**
 * Processes a parsed tree and creates all necessary data structures
 *
 * @param tree - The parsed Tree-sitter tree
 * @param doc - The CodeMirror document
 * @returns An object containing the formatted tree, node maps, and a set of all nodes
 */
export const processTree = (
  tree: Tree,
  doc: EditorState['doc']
): {
  formattedTree: TreeNodeInfo[];
  nodePositionMap: Map<SyntaxNode, NodePosition>;
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
