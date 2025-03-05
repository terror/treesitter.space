import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LanguageConfig,
  NodePosition,
  SupportedLanguage,
  SyntaxNode,
  TreeNodeInfo,
} from '@/lib/types';
import {
  createEditorState,
  getVisibleNodes,
  initializeParser,
  loadLanguage,
  parseCode,
  processTree,
} from '@/lib/utils';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { Compartment } from '@codemirror/state';
import {
  EditorView,
  ViewUpdate,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Language, Parser } from 'web-tree-sitter';

import { TreeNode } from './components/tree-node';
import {
  addHighlightEffect,
  highlightPlugin,
  removeHighlightEffect,
} from './lib/cm-highlight-extension';

const languageConfigs: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    name: 'javascript',
    displayName: 'JavaScript',
    wasmPath: '/tree-sitter-javascript.wasm',
    sampleCode:
      'let x = 1;\nfunction hello() {\n  console.log("Hello world!");\n  return x + 5;\n}\n\nhello();',
    cmExtension: javascript(),
  },
};

const App = () => {
  const [parser, setParser] = useState<Parser | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>('javascript');

  const [languages, setLanguages] = useState<Map<SupportedLanguage, Language>>(
    new Map()
  );

  const [formattedTree, setFormattedTree] = useState<TreeNodeInfo[]>([]);

  const [hoveredTreeNode, setHoveredTreeNode] = useState<SyntaxNode | null>(
    null
  );

  const [nodeToPositionMap, setNodeToPositionMap] = useState<
    Map<SyntaxNode, NodePosition>
  >(new Map());

  const [expandedNodes, setExpandedNodes] = useState<Set<SyntaxNode>>(
    new Set()
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const languageCompartment = useRef(new Compartment());

  useEffect(() => {
    const setup = async () => {
      try {
        setLoading(true);
        const newParser = await initializeParser();
        setParser(newParser);
      } catch (err) {
        setError(
          `Failed to initialize parser: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (parser) parser.delete();
      if (editorViewRef.current) editorViewRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const theme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
      },
      '&.cm-editor.cm-focused': {
        outline: 'none',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
      '.cm-content': {
        padding: '10px 0',
      },
      '.cm-line': {
        padding: '0 10px',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        borderRight: 'none',
        paddingRight: '8px',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      '.cm-activeLine': {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    });

    const onUpdate = (update: ViewUpdate) => {
      if (update.docChanged && parser && languages.has(currentLanguage)) {
        const newCode = update.state.doc.toString();
        const lang = languages.get(currentLanguage)!;
        const newTree = parseCode(parser, lang, newCode);

        if (newTree) {
          const { formattedTree, nodePositionMap, allNodes } = processTree(
            newTree,
            update.state.doc
          );

          setFormattedTree(formattedTree);
          setNodeToPositionMap(nodePositionMap);
          setExpandedNodes(allNodes);
        }
      }
    };

    const editorExtensions = [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      languageCompartment.current.of(
        languageConfigs[currentLanguage].cmExtension
      ),
      highlightPlugin,
      EditorView.updateListener.of(onUpdate),
      theme,
    ];

    const startState = createEditorState(
      languageConfigs[currentLanguage].sampleCode,
      editorExtensions
    );

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [parser, currentLanguage, languages]);

  useEffect(() => {
    const loadCurrentLanguage = async (langName: SupportedLanguage) => {
      if (!parser || languages.has(langName)) return;

      try {
        setLoading(true);
        const langConfig = languageConfigs[langName];
        const lang = await loadLanguage(langName, langConfig.wasmPath);

        setLanguages((prev) => {
          const updated = new Map(prev);
          updated.set(langName, lang);
          return updated;
        });

        if (langName === currentLanguage && editorViewRef.current) {
          const code = editorViewRef.current.state.doc.toString();
          const newTree = parseCode(parser, lang, code);

          if (newTree) {
            const { formattedTree, nodePositionMap, allNodes } = processTree(
              newTree,
              editorViewRef.current.state.doc
            );

            setFormattedTree(formattedTree);
            setNodeToPositionMap(nodePositionMap);
            setExpandedNodes(allNodes);
          }
        }
      } catch (err) {
        setError(
          `Failed to load language ${langName}: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    };

    if (parser && !languages.has(currentLanguage)) {
      loadCurrentLanguage(currentLanguage);
    }
  }, [parser, currentLanguage, languages]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: languageConfigs[lang].sampleCode,
        },
        effects: languageCompartment.current.reconfigure(
          languageConfigs[lang].cmExtension
        ),
      });

      setCurrentLanguage(lang);

      if (parser && languages.has(lang)) {
        const code = editorViewRef.current.state.doc.toString();
        const language = languages.get(lang)!;
        const newTree = parseCode(parser, language, code);

        if (newTree) {
          const { formattedTree, nodePositionMap, allNodes } = processTree(
            newTree,
            editorViewRef.current.state.doc
          );

          setFormattedTree(formattedTree);
          setNodeToPositionMap(nodePositionMap);
          setExpandedNodes(allNodes);
        }
      }
    }
  };

  useEffect(() => {
    if (hoveredTreeNode && editorViewRef.current) {
      const position = nodeToPositionMap.get(hoveredTreeNode);

      if (position) {
        const { from, to } = position;

        editorViewRef.current.dispatch({
          effects: [
            removeHighlightEffect.of(null),
            addHighlightEffect.of({ from, to }),
          ],
        });
      }
    } else if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        effects: [removeHighlightEffect.of(null)],
      });
    }
  }, [hoveredTreeNode, nodeToPositionMap]);

  const toggleNodeExpansion = useCallback(
    (node: SyntaxNode) => {
      setExpandedNodes((prevExpandedNodes) => {
        const newExpandedNodes = new Set(prevExpandedNodes);

        if (newExpandedNodes.has(node)) {
          newExpandedNodes.delete(node);
        } else {
          newExpandedNodes.add(node);
        }

        return newExpandedNodes;
      });
    },
    [expandedNodes]
  );

  const visibleTree = useMemo(
    () => getVisibleNodes(formattedTree, expandedNodes),
    [formattedTree, expandedNodes]
  );

  if (loading && !parser) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Loading parser...
      </div>
    );
  }

  if (error) {
    return <div className='p-4 text-red-500'>error: {error}</div>;
  }

  return (
    <div className='flex h-screen max-w-full flex-col'>
      <div className='flex items-center justify-between px-4 py-2'>
        <h1 className='font-semibold'>treesitter.space</h1>
      </div>

      <div className='flex-1 overflow-hidden p-4'>
        <ResizablePanelGroup
          direction='horizontal'
          className='h-full rounded border'
        >
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className='flex h-full min-h-0 flex-col overflow-hidden'>
              <div className='flex items-center justify-end border-b bg-gray-50 px-2 py-1'>
                <Select
                  value={currentLanguage}
                  onValueChange={(value) =>
                    handleLanguageChange(value as SupportedLanguage)
                  }
                >
                  <SelectTrigger className='h-7 w-36 bg-white text-sm'>
                    <SelectValue placeholder='Select language' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(languageConfigs).map((config) => (
                      <SelectItem key={config.name} value={config.name}>
                        {config.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div ref={editorRef} className='w-full flex-1' />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <div className='h-full overflow-auto'>
              {loading ? (
                <div className='flex h-full items-center justify-center'>
                  <p>Loading language...</p>
                </div>
              ) : visibleTree.length > 0 ? (
                <div className='p-2'>
                  {visibleTree.map((item, index) => (
                    <TreeNode
                      key={index}
                      item={item}
                      hoveredTreeNode={hoveredTreeNode}
                      setHoveredTreeNode={setHoveredTreeNode}
                      expandedNodes={expandedNodes}
                      toggleNodeExpansion={toggleNodeExpansion}
                    />
                  ))}
                </div>
              ) : (
                <p className='p-4 text-center text-gray-500'>
                  No parsed tree available
                </p>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default App;
