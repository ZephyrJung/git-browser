import React, { useState, useEffect } from 'react';
import type { AppSettings, SshKey, HttpCredential } from '@/shared/types';

interface SettingsDialogProps {
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings>({
    showHiddenFiles: true,
    showLineNumbers: true,
    theme: 'light',
    defaultMode: 'command',
    requireConfirmation: true,
    credentials: {
      sshKeys: [],
      httpCredentials: [],
    },
  });

  const [showAddSsh, setShowAddSsh] = useState(false);
  const [newSshName, setNewSshName] = useState('');
  const [newSshPath, setNewSshPath] = useState('');

  const [showAddHttp, setShowAddHttp] = useState(false);
  const [newHttpUrl, setNewHttpUrl] = useState('');
  const [newHttpUsername, setNewHttpUsername] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await window.electron.getSettings();
      setSettings(saved);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    await window.electron.saveSettings(settings);
    onClose();
  };

  const addSshKey = () => {
    if (!newSshName.trim() || !newSshPath.trim()) return;
    const newKey: SshKey = {
      id: Date.now().toString(),
      name: newSshName,
      path: newSshPath,
      isDefault: settings.credentials.sshKeys.length === 0,
    };
    setSettings({
      ...settings,
      credentials: {
        ...settings.credentials,
        sshKeys: [...settings.credentials.sshKeys, newKey],
      },
    });
    setNewSshName('');
    setNewSshPath('');
    setShowAddSsh(false);
  };

  const deleteSshKey = (id: string) => {
    setSettings({
      ...settings,
      credentials: {
        ...settings.credentials,
        sshKeys: settings.credentials.sshKeys.filter(k => k.id !== id),
      },
    });
  };

  const setDefaultSsh = (id: string) => {
    setSettings({
      ...settings,
      credentials: {
        ...settings.credentials,
        sshKeys: settings.credentials.sshKeys.map(k => ({
          ...k,
          isDefault: k.id === id,
        })),
      },
    });
  };

  const addHttpCredential = () => {
    if (!newHttpUrl.trim() || !newHttpUsername.trim()) return;
    const newCred: HttpCredential = {
      id: Date.now().toString(),
      url: newHttpUrl,
      username: newHttpUsername,
    };
    setSettings({
      ...settings,
      credentials: {
        ...settings.credentials,
        httpCredentials: [...settings.credentials.httpCredentials, newCred],
      },
    });
    setNewHttpUrl('');
    setNewHttpUsername('');
    setShowAddHttp(false);
  };

  const deleteHttpCredential = (id: string) => {
    setSettings({
      ...settings,
      credentials: {
        ...settings.credentials,
        httpCredentials: settings.credentials.httpCredentials.filter(c => c.id !== id),
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">设置</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 凭证配置 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">凭证配置</h3>

          {/* SSH Key 管理 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">SSH Key</h4>
              <button
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowAddSsh(!showAddSsh)}
              >
                添加
              </button>
            </div>
            {showAddSsh && (
              <div className="mb-3 p-3 border rounded border-gray-300 dark:border-gray-700">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="名称"
                    className="flex-1 px-2 py-1 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    value={newSshName}
                    onChange={e => setNewSshName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="文件路径"
                    className="flex-1 px-2 py-1 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    value={newSshPath}
                    onChange={e => setNewSshPath(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={addSshKey}
                  >
                    确认添加
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {settings.credentials.sshKeys.map(key => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-2 border rounded border-gray-300 dark:border-gray-700"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {key.name}
                      {key.isDefault && (
                        <span className="ml-2 px-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                          默认
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{key.path}</div>
                  </div>
                  <div className="flex gap-2">
                    {!key.isDefault && (
                      <button
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setDefaultSsh(key.id)}
                      >
                        设为默认
                      </button>
                    )}
                    <button
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => deleteSshKey(key.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {settings.credentials.sshKeys.length === 0 && (
                <div className="text-sm text-gray-500 p-2">暂无 SSH Key</div>
              )}
            </div>
          </div>

          {/* HTTP 凭证管理 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">HTTP 凭证</h4>
              <button
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowAddHttp(!showAddHttp)}
              >
                添加
              </button>
            </div>
            {showAddHttp && (
              <div className="mb-3 p-3 border rounded border-gray-300 dark:border-gray-700">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="仓库地址"
                    className="flex-1 px-2 py-1 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    value={newHttpUrl}
                    onChange={e => setNewHttpUrl(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="用户名"
                    className="flex-1 px-2 py-1 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    value={newHttpUsername}
                    onChange={e => setNewHttpUsername(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={addHttpCredential}
                  >
                    确认添加
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {settings.credentials.httpCredentials.map(cred => (
                <div
                  key={cred.id}
                  className="flex items-center justify-between p-2 border rounded border-gray-300 dark:border-gray-700"
                >
                  <div>
                    <div className="text-sm font-medium">{cred.url}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">用户名: {cred.username}</div>
                  </div>
                  <button
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => deleteHttpCredential(cred.id)}
                  >
                    删除
                  </button>
                </div>
              ))}
              {settings.credentials.httpCredentials.length === 0 && (
                <div className="text-sm text-gray-500 p-2">暂无 HTTP 凭证</div>
              )}
            </div>
          </div>
        </div>

        {/* 显示设置 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">显示设置</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">显示隐藏文件（. 开头）</span>
              <input
                type="checkbox"
                checked={settings.showHiddenFiles}
                onChange={e => setSettings({ ...settings, showHiddenFiles: e.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">显示代码行号</span>
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={e => setSettings({ ...settings, showLineNumbers: e.target.checked })}
              />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm">主题</span>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded border ${
                    settings.theme === 'light'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                >
                  亮色
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded border ${
                    settings.theme === 'dark'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                >
                  深色
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 模式设置 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">模式设置</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">默认启动模式</span>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded border ${
                    settings.defaultMode === 'command'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setSettings({ ...settings, defaultMode: 'command' })}
                >
                  命令模式
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded border ${
                    settings.defaultMode === 'button'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setSettings({ ...settings, defaultMode: 'button' })}
                >
                  按钮模式
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 安全性设置 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">安全性</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">按键模式下操作需要安全确认</span>
              <input
                type="checkbox"
                checked={settings.requireConfirmation}
                onChange={e => setSettings({ ...settings, requireConfirmation: e.target.checked })}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
