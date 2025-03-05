import { Extension } from '@codemirror/state';

export interface SyntaxNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  childCount: number;
  children: SyntaxNode[];
}

export type SupportedLanguage = 'javascript' | 'python' | 'rust' | 'cpp';

export interface LanguageConfig {
  name: SupportedLanguage;
  displayName: string;
  wasmPath: string;
  sampleCode: string;
  cmExtension: Extension;
}

export interface TreeNodeInfo {
  text: string;
  node: SyntaxNode;
  level: number;
  type: string;
}

export interface NodePosition {
  from: number;
  to: number;
}
