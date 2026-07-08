import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/appStore';
import { Globe, HardDrive, Webhook, Users, Check, Copy, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const toggleLanguage = useAppStore(state => state.toggleLanguage);
  const language = useAppStore(state => state.language);
  
  const [webhookSecret, setWebhookSecret] = useState('whsec_a1b2c3d4e5f6g7h8i9j0');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'general', label: 'Language & Appearance', icon: Globe },
    { id: 'backup', label: 'Backup & Restore', icon: HardDrive },
    { id: 'webhook', label: 'API & Webhooks', icon: Webhook },
    { id: 'users', label: 'Users & Roles', icon: Users },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRenew = () => {
    // Generate random 24 char string
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'whsec_';
    for (let i = 0; i < 24; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setWebhookSecret(result);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{t('settings')}</h1>
        <p className="text-sm text-surface-500 mt-1">Manage system preferences and configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>Language & Appearance</CardTitle>
                <CardDescription>Customize how SubManager looks and feels on your device.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-surface-900 mb-3">System Language</h4>
                  <div className="flex gap-4">
                    <button
                      onClick={() => language !== 'en' && toggleLanguage()}
                      className={`flex-1 border rounded-lg p-4 text-center transition-all ${
                        language === 'en' 
                          ? 'border-primary-600 bg-primary-50 text-primary-900 ring-1 ring-primary-600' 
                          : 'border-surface-200 hover:border-surface-300 bg-white text-surface-700'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">🇬🇧</span>
                      <span className="font-medium">English (LTR)</span>
                    </button>
                    <button
                      onClick={() => language !== 'ar' && toggleLanguage()}
                      className={`flex-1 border rounded-lg p-4 text-center transition-all ${
                        language === 'ar' 
                          ? 'border-primary-600 bg-primary-50 text-primary-900 ring-1 ring-primary-600' 
                          : 'border-surface-200 hover:border-surface-300 bg-white text-surface-700'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">🇸🇦</span>
                      <span className="font-medium">العربية (RTL)</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'backup' && (
            <Card>
              <CardHeader>
                <CardTitle>Database Backup</CardTitle>
                <CardDescription>Configure automatic backups or create a manual snapshot of your data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Backup Directory Path</label>
                  <div className="flex gap-2">
                    <Input defaultValue="/Users/Shared/SubManager/Backups" className="flex-1" />
                    <Button variant="outline">Browse</Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Schedule</label>
                  <select className="flex h-10 w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Daily at 12:00 AM</option>
                    <option>Weekly (Sunday)</option>
                    <option>Monthly (1st day)</option>
                    <option>Manual Only</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
                  <Button variant="secondary">Create Manual Backup Now</Button>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'webhook' && (
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>Manage incoming events from external payment gateways.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Webhook URL</label>
                  <Input defaultValue="https://api.submanager.local/webhooks/stripe" readOnly className="bg-surface-50 text-surface-500" />
                  <p className="text-xs text-surface-500 mt-1">This is where your external services should send POST requests.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Signing Secret</label>
                  <div className="flex gap-2">
                    <Input type="password" value={webhookSecret} readOnly className="flex-1 font-mono text-lg tracking-widest" />
                    <Button variant="outline" onClick={handleCopy} title="Copy to clipboard">
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" onClick={handleRenew} title="Renew Secret">
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                    </Button>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">Keep this secret safe. Renewing will immediately invalidate the old secret.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>Users & Permissions</CardTitle>
                <CardDescription>Manage staff members and their access levels.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-surface-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-surface-200">
                    <thead className="bg-surface-50">
                      <tr>
                        <th className="px-4 py-3 text-start text-xs font-medium text-surface-500 uppercase">Username</th>
                        <th className="px-4 py-3 text-start text-xs font-medium text-surface-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-start text-xs font-medium text-surface-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-end text-xs font-medium text-surface-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-surface-200">
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-surface-900">admin</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-surface-500">Administrator</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Active</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-end text-sm">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline">Add New User</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
