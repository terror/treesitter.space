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
  Position,
  SupportedLanguage,
  SyntaxNode,
  TreeNodeInfo,
} from '@/lib/types';
import { getVisibleNodes, parseCode, processTree } from '@/lib/utils';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { Compartment, EditorState, Extension } from '@codemirror/state';
import {
  EditorView,
  ViewUpdate,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Language, Parser } from 'web-tree-sitter';

import {
  EditorSettings,
  EditorSettingsDialog,
  defaultEditorSettings,
} from './components/editor-settings-dialog';
import { TreeNode } from './components/tree-node';
import {
  addHighlightEffect,
  highlightPlugin,
  removeHighlightEffect,
} from './lib/cm-highlight-extension';
import { languageConfig } from './lib/language-config';

const App = () => {
  const [parser, setParser] = useState<Parser | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedTree, setFormattedTree] = useState<TreeNodeInfo[]>([]);

  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>('javascript');

  const [languages, setLanguages] = useState<Map<SupportedLanguage, Language>>(
    new Map()
  );

  const [hoveredTreeNode, setHoveredTreeNode] = useState<SyntaxNode | null>(
    null
  );

  const [nodeToPositionMap, setNodeToPositionMap] = useState<
    Map<SyntaxNode, Position>
  >(new Map());

  const [expandedNodes, setExpandedNodes] = useState<Set<SyntaxNode>>(
    new Set()
  );

  const [editorSettings, setEditorSettings] = useState<EditorSettings>(
    defaultEditorSettings
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const compartments = {
    language: useRef(new Compartment()),
    vim: useRef(new Compartment()),
    lineWrap: useRef(new Compartment()),
    lineNumbers: useRef(new Compartment()),
    fontSize: useRef(new Compartment()),
    tabSize: useRef(new Compartment()),
  };

  useEffect(() => {
    const setup = async () => {
      try {
        setLoading(true);

        await Parser.init({
          locateFile(scriptName: string, _scriptDirectory: string) {
            return scriptName;
          },
        });

        setParser(new Parser());
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
      if (parser) {
        parser.delete();
      }

      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!editorViewRef.current) return;

    editorViewRef.current.dispatch({
      effects: [
        compartments.vim.current.reconfigure(
          editorSettings.vimMode ? vim() : []
        ),
        compartments.lineWrap.current.reconfigure(
          editorSettings.lineWrapping ? EditorView.lineWrapping : []
        ),
        compartments.lineNumbers.current.reconfigure(
          editorSettings.lineNumbers ? lineNumbers() : []
        ),
        compartments.fontSize.current.reconfigure(
          EditorView.theme({
            '&': {
              fontSize: `${editorSettings.fontSize}px`,
            },
          })
        ),
        compartments.tabSize.current.reconfigure(
          EditorState.tabSize.of(editorSettings.tabSize)
        ),
      ],
    });
  }, [editorSettings]);

  useEffect(() => {
    if (!editorRef.current) return;

    const theme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: `${editorSettings.fontSize}px`,
        display: 'flex',
        flexDirection: 'column',
      },
      '&.cm-editor': {
        height: '100%', // Ensure editor takes full height
      },
      '.cm-scroller': {
        overflow: 'auto',
        flex: '1 1 auto', // Allow scroller to grow
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
      '.cm-fat-cursor': {
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderLeft: 'none',
        width: '0.6em',
      },
      '.cm-cursor-secondary': {
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
      },
    });

    const onUpdate = (update: ViewUpdate) => {
      if (update.docChanged && parser && languages.has(currentLanguage)) {
        const newCode = update.state.doc.toString();

        const language = languages.get(currentLanguage);

        if (!language) return;

        const newTree = parseCode(parser, language, newCode);

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

    const editorExtensions: Extension[] = [
      compartments.vim.current.of(editorSettings.vimMode ? vim() : []),
      compartments.lineNumbers.current.of(
        editorSettings.lineNumbers ? lineNumbers() : []
      ),
      compartments.lineWrap.current.of(
        editorSettings.lineWrapping ? EditorView.lineWrapping : []
      ),
      compartments.fontSize.current.of(
        EditorView.theme({
          '&': {
            fontSize: `${editorSettings.fontSize}px`,
          },
        })
      ),
      compartments.tabSize.current.of(
        EditorState.tabSize.of(editorSettings.tabSize)
      ),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      compartments.language.current.of(
        languageConfig[currentLanguage].cmExtension
      ),
      highlightPlugin,
      EditorView.updateListener.of(onUpdate),
      theme,
    ];

    const startState = EditorState.create({
      doc: languageConfig[currentLanguage].sampleCode,
      extensions: editorExtensions,
    });

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

        const config = languageConfig[langName];

        const language = await Language.load(config.wasmPath);

        setLanguages((prev) => {
          const updated = new Map(prev);
          updated.set(langName, language);
          return updated;
        });

        if (langName === currentLanguage && editorViewRef.current) {
          const code = editorViewRef.current.state.doc.toString();
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
          insert: languageConfig[lang].sampleCode,
        },
        effects: compartments.language.current.reconfigure(
          languageConfig[lang].cmExtension
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
        const { start: from, end: to } = position;

        editorViewRef.current.dispatch({
          effects: [
            removeHighlightEffect.of(null),
            addHighlightEffect.of({ from, to }),
            EditorView.scrollIntoView(from, { y: 'center' }),
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

  const updateEditorSetting = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    setEditorSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading && !parser) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Loading parser...
      </div>
    );
  }

  if (error) {
    return <div className='p-4'>error: {error}</div>;
  }

  return (
    <div className='flex h-screen max-w-full flex-col'>
      <div className='flex items-center justify-between px-4 py-4'>
        <a href='/treesitter.space/' className='font-semibold'>
          treesitter.space
        </a>
      </div>

      <div className='flex-1 overflow-hidden p-4'>
        <ResizablePanelGroup
          direction='horizontal'
          className='h-full rounded border'
        >
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className='flex h-full min-h-0 flex-col overflow-hidden'>
              <div className='flex items-center justify-between border-b bg-gray-50 px-2 py-1'>
                <div className='flex items-center'>
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
                      {Object.values(languageConfig).map((config) => (
                        <SelectItem key={config.name} value={config.name}>
                          {config.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editorSettings.vimMode && (
                    <span className='ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs'>
                      VIM
                    </span>
                  )}
                </div>

                <EditorSettingsDialog
                  settings={editorSettings}
                  updateSetting={updateEditorSetting}
                />
              </div>
              <div ref={editorRef} className='w-full flex-1 overflow-hidden' />
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
