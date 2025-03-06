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
import { Language, Position, SyntaxNode, TreeNodeInfo } from '@/lib/types';
import { getVisibleNodes, parse, processTree } from '@/lib/utils';
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
import { TentTree } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Parser, Language as TSLanguage } from 'web-tree-sitter';

import { EditorSettingsDialog } from './components/editor-settings-dialog';
import { TreeNode } from './components/tree-node';
import {
  addHighlightEffect,
  highlightPlugin,
  removeHighlightEffect,
} from './lib/cm-highlight-extension';
import { languageConfig } from './lib/language-config';
import { useEditorSettings } from './providers/editor-settings-provider';

const App = () => {
  const [error, setError] = useState<string | null>(null);
  const [formattedTree, setFormattedTree] = useState<TreeNodeInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [parser, setParser] = useState<Parser | undefined>(undefined);

  const [languages, sets] = useState<Map<Language, TSLanguage>>(new Map());

  const [hoveredTreeNode, setHoveredTreeNode] = useState<SyntaxNode | null>(
    null
  );

  const [nodeToPositionMap, setNodeToPositionMap] = useState<
    Map<SyntaxNode, Position>
  >(new Map());

  const [expandedNodes, setExpandedNodes] = useState<Set<SyntaxNode>>(
    new Set()
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const { settings: editorSettings, updateSettings: updateEditorSettings } =
    useEditorSettings();

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

  const onEditorUpdate = useCallback(
    (update: ViewUpdate) => {
      if (
        update.docChanged &&
        parser &&
        languages.has(editorSettings.language)
      ) {
        const newCode = update.state.doc.toString();

        const language = languages.get(editorSettings.language);

        if (!language) return;

        const newTree = parse({ parser, language, code: newCode });

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
    },
    [
      editorSettings.language,
      languages,
      parser,
      setExpandedNodes,
      setFormattedTree,
      setNodeToPositionMap,
    ]
  );

  const createEditorTheme = useCallback(
    () =>
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: `${editorSettings.fontSize}px`,
          display: 'flex',
          flexDirection: 'column',
        },
        '&.cm-editor': {
          height: '100%',
        },
        '.cm-scroller': {
          overflow: 'auto',
          flex: '1 1 auto',
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
      }),
    [editorSettings]
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions: Extension[] = [
      EditorState.tabSize.of(editorSettings.tabSize),
      EditorView.updateListener.of(onEditorUpdate),
      bracketMatching(),
      createEditorTheme(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightPlugin,
      history(),
      indentOnInput(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      languageConfig[editorSettings.language].cmExtension,
      syntaxHighlighting(defaultHighlightStyle),
    ];

    if (editorSettings.keybindings === 'vim') {
      extensions.push(vim());
    }

    if (editorSettings.lineNumbers) {
      extensions.push(lineNumbers());
    }

    if (editorSettings.lineWrapping) {
      extensions.push(EditorView.lineWrapping);
    }

    const state = EditorState.create({
      doc: languageConfig[editorSettings.language].sampleCode,
      extensions: extensions,
    });

    const view = new EditorView({
      state: state,
      parent: editorRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [parser, editorSettings.language, languages, editorSettings]);

  useEffect(() => {
    const loadLanguage = async (languageName: Language) => {
      if (!parser || languages.has(languageName)) return;

      try {
        setLoading(true);

        const config = languageConfig[languageName];

        const language = await TSLanguage.load(config.wasmPath);

        sets((prev) => {
          const updated = new Map(prev);
          updated.set(languageName, language);
          return updated;
        });

        if (languageName === editorSettings.language && editorViewRef.current) {
          const code = editorViewRef.current.state.doc.toString();

          const newTree = parse({ parser, language, code });

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
          `Failed to load language ${languageName}: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadLanguage(editorSettings.language);
  }, [parser, editorSettings.language, languages]);

  const handleChange = (newLanguage: Language) => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: languageConfig[newLanguage].sampleCode,
        },
        effects: new Compartment().reconfigure(
          languageConfig[newLanguage].cmExtension
        ),
      });

      updateEditorSettings({ language: newLanguage });

      if (parser && languages.has(newLanguage)) {
        const code = editorViewRef.current.state.doc.toString();

        const language = languages.get(newLanguage);

        if (!language) return;

        const newTree = parse({ parser, language, code });

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
      <div className='flex items-center gap-x-2 px-4 py-4'>
        <TentTree className='h-4 w-4' />
        <a href='/' className='font-semibold'>
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
                    value={editorSettings.language}
                    onValueChange={(value) => handleChange(value as Language)}
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
                  {editorSettings.keybindings === 'vim' && (
                    <span className='ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs'>
                      VIM
                    </span>
                  )}
                </div>

                <EditorSettingsDialog />
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
