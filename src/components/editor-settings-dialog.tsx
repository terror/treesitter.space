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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { useState } from 'react';

export interface EditorSettings {
  fontSize: number;
  lineNumbers: boolean;
  lineWrapping: boolean;
  tabSize: number;
  theme: 'light' | 'dark' | 'system';
  vimMode: boolean;
}

export const defaultEditorSettings: EditorSettings = {
  fontSize: 14,
  lineNumbers: true,
  lineWrapping: false,
  tabSize: 2,
  theme: 'system',
  vimMode: false,
};

interface EditorSettingsDialogProps {
  settings: EditorSettings;
  updateSetting: <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => void;
}

export const EditorSettingsDialog = ({
  settings,
  updateSetting,
}: EditorSettingsDialogProps) => {
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => setSettingsOpen(true)}
        title='Settings'
        className='h-7 w-7 cursor-pointer'
      >
        <Settings className='h-4 w-4' />
      </Button>

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
                onCheckedChange={(checked) =>
                  updateSetting('lineNumbers', checked)
                }
              />
            </div>

            <div className='flex items-center justify-between'>
              <Label htmlFor='tab-size' className='text-sm font-medium'>
                Tab Size
              </Label>
              <Select
                value={settings.tabSize.toString()}
                onValueChange={(value) =>
                  updateSetting('tabSize', parseInt(value))
                }
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
    </>
  );
};
