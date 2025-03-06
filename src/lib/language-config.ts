import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';

import type { LanguageConfig, SupportedLanguage } from './types';

export const languageConfig: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    name: 'javascript',
    displayName: 'JavaScript',
    wasmPath: 'tree-sitter-javascript.wasm',
    sampleCode:
      'let x = 1;\n\nfunction hello() {\n  console.log("Hello world!");\n  return x + 5;\n}\n\nhello();',
    cmExtension: javascript(),
  },
  python: {
    name: 'python',
    displayName: 'Python',
    wasmPath: 'tree-sitter-python.wasm',
    sampleCode:
      'x = 1\n\ndef hello():\n  print("Hello world!")\n  return x + 5\n\nhello()',
    cmExtension: python(),
  },
  rust: {
    name: 'rust',
    displayName: 'Rust',
    wasmPath: 'tree-sitter-rust.wasm',
    sampleCode:
      'fn main() {\n  let x = 1;\n  println!("Hello world!");\n  let result = x + 5;\n  println!("{}", result);\n}',
    cmExtension: rust(),
  },
  cpp: {
    name: 'cpp',
    displayName: 'C++',
    wasmPath: 'tree-sitter-cpp.wasm',
    sampleCode:
      '#include <iostream>\n\nint main() {\n  int x = 1;\n  std::cout << "Hello world!" << std::endl;\n  int result = x + 5;\n  std::cout << result << std::endl;\n  return 0;\n}',
    cmExtension: cpp(),
  },
};
