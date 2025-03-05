import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
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
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  ViewUpdate,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import { Settings2 } from 'lucide-react';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

interface EditorSettings {
  fontSize: number;
  lineNumbers: boolean;
  lineWrapping: boolean;
  tabSize: number;
  theme: 'light' | 'dark' | 'system';
  vimMode: boolean;
}

const defaultEditorSettings: EditorSettings = {
  fontSize: 14,
  lineNumbers: true,
  lineWrapping: false,
  tabSize: 2,
  theme: 'system',
  vimMode: false,
};

const EditorSettingsModal = ({
  setSettingsOpen,
  settings,
  settingsOpen,
  updateSetting,
}: {
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
  settings: any;
  settingsOpen: boolean;
  updateSetting: any;
}) => (
  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
    <DialogContent className='sm:max-w-[425px]'>
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Customize your editor experience with these settings.
        </DialogDescription>
      </DialogHeader>

      <div className='grid gap-4 py-4'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='vim-mode' className='text-sm font-medium'>
            Vim Mode
          </Label>
          <Switch
            id='vim-mode'
            checked={settings.vimMode}
            onCheckedChange={(checked) => updateSetting('vimMode', checked)}
          />
        </div>

        <div className='flex items-center justify-between'>
          <Label htmlFor='line-wrapping' className='text-sm font-medium'>
            Line Wrapping
          </Label>
          <Switch
            id='line-wrapping'
            checked={settings.lineWrapping}
            onCheckedChange={(checked) =>
              updateSetting('lineWrapping', checked)
            }
          />
        </div>

        <div className='flex items-center justify-between'>
          <Label htmlFor='line-numbers' className='text-sm font-medium'>
            Line Numbers
          </Label>
          <Switch
            id='line-numbers'
            checked={settings.lineNumbers}
            onCheckedChange={(checked) => updateSetting('lineNumbers', checked)}
          />
        </div>

        <div className='flex items-center justify-between'>
          <Label htmlFor='tab-size' className='text-sm font-medium'>
            Tab Size
          </Label>
          <Select
            value={settings.tabSize.toString()}
            onValueChange={(value) => updateSetting('tabSize', parseInt(value))}
          >
            <SelectTrigger id='tab-size' className='w-28'>
              <SelectValue placeholder='Tab Size' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='2'>2 spaces</SelectItem>
              <SelectItem value='4'>4 spaces</SelectItem>
              <SelectItem value='8'>8 spaces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center justify-between'>
          <Label htmlFor='theme' className='text-sm font-medium'>
            Theme
          </Label>
          <Select
            value={settings.theme}
            onValueChange={(value) =>
              updateSetting('theme', value as 'light' | 'dark' | 'system')
            }
          >
            <SelectTrigger id='theme' className='w-28'>
              <SelectValue placeholder='Theme' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='light'>Light</SelectItem>
              <SelectItem value='dark'>Dark</SelectItem>
              <SelectItem value='system'>System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center justify-between'>
          <Label htmlFor='font-size' className='text-sm font-medium'>
            Font Size
          </Label>
          <Select
            value={settings.fontSize.toString()}
            onValueChange={(value) =>
              updateSetting('fontSize', parseInt(value))
            }
          >
            <SelectTrigger id='font-size' className='w-28'>
              <SelectValue placeholder='Font Size' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='12'>12px</SelectItem>
              <SelectItem value='14'>14px</SelectItem>
              <SelectItem value='16'>16px</SelectItem>
              <SelectItem value='18'>18px</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

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

  // Settings state
  const [settings, setSettings] = useState<EditorSettings>(defaultEditorSettings);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const languageCompartment = useRef(new Compartment());
  const vimCompartment = useRef(new Compartment());
  const lineWrapCompartment = useRef(new Compartment());
  const lineNumbersCompartment = useRef(new Compartment());
  const fontSizeCompartment = useRef(new Compartment());
  const tabSizeCompartment = useRef(new Compartment());

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

  // Apply editor settings
  useEffect(() => {
    if (!editorViewRef.current) return;

    editorViewRef.current.dispatch({
      effects: [
        vimCompartment.current.reconfigure(settings.vimMode ? vim() : []),
        lineWrapCompartment.current.reconfigure(
          settings.lineWrapping ? EditorView.lineWrapping : []
        ),
        lineNumbersCompartment.current.reconfigure(
          settings.lineNumbers ? lineNumbers() : []
        ),
        fontSizeCompartment.current.reconfigure(
          EditorView.theme({
            '&': {
              fontSize: `${settings.fontSize}px`,
            },
          })
        ),
        tabSizeCompartment.current.reconfigure(
          EditorState.tabSize.of(settings.tabSize)
        ),
      ],
    });
  }, [settings]);

  useEffect(() => {
    if (!editorRef.current) return;

    const theme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: `${settings.fontSize}px`,
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
      // VIM cursor styles
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
      vimCompartment.current.of(settings.vimMode ? vim() : []),
      lineNumbersCompartment.current.of(
        settings.lineNumbers ? lineNumbers() : []
      ),
      lineWrapCompartment.current.of(
        settings.lineWrapping ? EditorView.lineWrapping : []
      ),
      fontSizeCompartment.current.of(
        EditorView.theme({
          '&': {
            fontSize: `${settings.fontSize}px`,
          },
        })
      ),
      tabSizeCompartment.current.of(EditorState.tabSize.of(settings.tabSize)),
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

  const updateSetting = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    setSettings((prev) => ({
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
    return <div className='p-4 text-red-500'>error: {error}</div>;
  }

  return (
    <div className='flex h-screen max-w-full flex-col'>
      <div className='flex items-center justify-between px-4 py-4'>
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
                  {settings.vimMode && (
                    <span className='ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs'>
                      VIM
                    </span>
                  )}
                </div>

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setSettingsOpen(true)}
                  title='Settings'
                  className='h-7 w-7'
                >
                  <Settings2 className='h-4 w-4' />
                </Button>
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

      <EditorSettingsModal
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        updateSetting={updateSetting}
        settings={settings}
      />
    </div>
  );
};

export default App;
