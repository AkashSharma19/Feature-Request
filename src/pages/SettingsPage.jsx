import { useState, useEffect } from 'react';
import { 
  Save, 
  ExternalLink, 
  Info, 
  CheckCircle,
  RefreshCw,
  Layers,
  Mail,
  Zap,
  ArrowLeft,
  ChevronRight,
  Layout,
  Plus,
  Trash2,
  Edit2,
  ListTodo,
  Type,
  FileText,
  AlignLeft,
  Settings,
  Copy,
  Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useStore } from '../store/useStore';
import { Card, Button, Input, StatusBadge, Select } from '../components/ui';
import { STATUSES, cn } from '../lib/utils';
import EmailsPage from './EmailsPage';

const TABS = [
  { id: 'integrations', label: 'Integrations', icon: Layers },
  { id: 'notifications', label: 'Email Notifications', icon: Mail },
  { id: 'boards', label: 'Boards & Form', icon: Layout },
];

export default function SettingsPage() {
  const { 
    userOrg,
    clickupSettings, updateClickupSettings, 
    boards, addBoard, updateBoard, deleteBoard,
    questionnaires, updateQuestionnaire
  } = useStore();

  const [activeTab, setActiveTab] = useState('integrations');
  const [activeIntegration, setActiveIntegration] = useState(null);
  const [activeBoard, setActiveBoard] = useState(null); // The board being configured
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Local state for ClickUp form
  const [formData, setFormData] = useState({
    apiKey: '',
    teamId: '',
    statusMap: {}
  });

  // Local state for Questionnaire
  const [qFields, setQFields] = useState([]);

  // Sync ClickUp data
  useEffect(() => {
    if (clickupSettings) {
      setFormData({
        apiKey: clickupSettings.apiKey || '',
        teamId: clickupSettings.teamId || '',
        statusMap: clickupSettings.statusMap || {}
      });
    }
  }, [clickupSettings]);

  // Sync Questionnaire data when a board is selected
  useEffect(() => {
    if (activeBoard && questionnaires[activeBoard.id]) {
      setQFields(questionnaires[activeBoard.id]);
    } else {
      setQFields([]);
    }
  }, [activeBoard, questionnaires]);

  const handleSaveClickUp = async () => {
    setLoading(true);
    try {
      await updateClickupSettings(formData);
      toast.success('ClickUp configuration saved!');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save ClickUp settings:", error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestionnaire = async () => {
    if (!activeBoard) return;
    setLoading(true);
    try {
      await updateQuestionnaire(activeBoard.id, qFields);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save questionnaire:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoard = async () => {
    const name = prompt("Enter Board Name (e.g. Product Features):");
    if (name) {
      await addBoard({ name, createdAt: new Date().toISOString() });
    }
  };

  const addField = () => {
    setQFields(prev => [
      ...prev,
      { id: Date.now().toString(), label: '', type: 'text', required: false, options: '' }
    ]);
  };

  const removeField = (id) => {
    setQFields(prev => prev.filter(f => f.id !== id));
  };

  const updateField = (id, updates) => {
    setQFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const isClickUpConnected = !!clickupSettings.apiKey;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-500 mt-1">Configure your workspace and customize user experience.</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-fade-in bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            <CheckCircle size={16} /> Saved Successfully
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setActiveIntegration(null); setActiveBoard(null); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  isActive ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                )}
              >
                <Icon size={18} className={isActive ? "text-teal-600" : "text-gray-400"} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* ── Integrations Tab ─────────────────────────────────── */}
          {activeTab === 'integrations' && (
            <div className="animate-fade-in">
              {!activeIntegration ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* ClickUp Card */}
                  <Card 
                    className="p-6 cursor-pointer hover:border-teal-300 hover:shadow-md transition-all group"
                    onClick={() => setActiveIntegration('clickup')}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                      </div>
                      <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", isClickUpConnected ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                        {isClickUpConnected ? 'Connected' : 'Setup'}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">ClickUp</h3>
                    <p className="text-xs text-gray-500 mt-1">Sync task statuses automatically.</p>
                  </Card>
                  {/* ... other placeholders ... */}
                </div>
              ) : (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setActiveIntegration(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-600 transition-colors">
                      <ArrowLeft size={16} /> Back to Integrations
                    </button>
                    <Button onClick={handleSaveClickUp} disabled={loading} size="sm">
                      {loading ? <RefreshCw size={14} className="animate-spin" /> : <><Save size={14} /> Save ClickUp Config</>}
                    </Button>
                  </div>
                  <Card className="p-6 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">API Token</label>
                        <Input type="password" placeholder="pk_..." value={formData.apiKey} onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Team ID</label>
                        <Input placeholder="1234567" value={formData.teamId} onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))} />
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <RefreshCw size={16} className="text-teal-600" />
                        <h4 className="text-sm font-bold text-gray-900">Status Mapping</h4>
                      </div>
                      <p className="text-xs text-gray-500 mb-6">Map your local statuses to the exact status names in ClickUp for auto-sync.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {STATUSES.map(s => {
                          const examples = {
                            'Open': 'to do',
                            'In Progress': 'in progress',
                            'In Design': 'designing',
                            'Under Review': 'review',
                            'Development': 'development',
                            'Testing': 'qa / testing',
                            'Tested': 'ready for release',
                            'Closed': 'complete',
                            'Cancelled': 'closed / cancelled'
                          };
                          return (
                            <div key={s}>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{s}</label>
                              <Input 
                                placeholder={`e.g. "${examples[s] || s.toLowerCase()}"`}
                                value={formData.statusMap[s] || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  statusMap: { ...prev.statusMap, [s]: e.target.value }
                                }))}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* ── Notifications Tab ────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <EmailsPage hideHeader />
            </div>
          )}

          {/* ── Boards Tab ──────────────────────────────────────── */}
          {activeTab === 'boards' && (
            <div className="animate-fade-in space-y-8">
              {!activeBoard ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Feedback Boards</h2>
                      <p className="text-sm text-gray-500">Manage different categories of feedback and their submission forms.</p>
                    </div>
                    <Button onClick={handleAddBoard} size="sm">
                      <Plus size={16} /> Create Board
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {boards.length === 0 ? (
                      <Card className="p-12 text-center border-dashed bg-gray-50/50">
                        <p className="text-gray-400 text-sm">No boards created yet. Click "Create Board" to get started.</p>
                      </Card>
                    ) : (
                      boards.map(board => (
                        <Card key={board.id} className="p-4 flex items-center justify-between hover:border-teal-300 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                              <Layout size={20} />
                            </div>
                             <div>
                               <p className="font-bold text-gray-900">{board.name}</p>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                 Form: {2 + (questionnaires[board.id]?.length || 0)} fields ({questionnaires[board.id]?.length || 0} custom)
                               </p>
                             </div>

                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => {
                                const url = `${window.location.origin}/b/${userOrg.id}/${board.id}`;
                                navigator.clipboard.writeText(url);
                                alert("Link copied to clipboard!");
                              }}
                            >
                              <Copy size={14} /> Copy Link
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setActiveBoard(board)}>
                              <Settings size={14} /> Configure Form
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => deleteBoard(board.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setActiveBoard(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-600 transition-colors">
                      <ArrowLeft size={16} /> Back to Boards
                    </button>
                    <Button onClick={handleSaveQuestionnaire} disabled={loading} size="sm">
                      {loading ? <RefreshCw size={14} className="animate-spin" /> : <><Save size={14} /> Save Questionnaire</>}
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                      <ListTodo size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{activeBoard.name} Questionnaire</h2>
                      <p className="text-sm text-gray-500">Customize the fields users fill out when submitting to this board.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Read-only Standard Fields */}
                    <Card className="p-4 bg-gray-50/50 border-gray-200 opacity-75">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Standard Field</label>
                          <p className="text-sm font-bold text-gray-900">Feature Title</p>
                        </div>
                        <div className="w-32">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Type</span>
                          <span className="text-xs text-gray-600 font-medium">Short Text</span>
                        </div>
                        <div className="w-20 text-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Required</span>
                          <CheckCircle size={14} className="text-teal-600 mx-auto" />
                        </div>
                        <div className="w-10"></div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gray-50/50 border-gray-200 opacity-75">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Standard Field</label>
                          <p className="text-sm font-bold text-gray-900">Detailed Context / Description</p>
                        </div>
                        <div className="w-32">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Type</span>
                          <span className="text-xs text-gray-600 font-medium">Rich Text</span>
                        </div>
                        <div className="w-20 text-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Required</span>
                          <CheckCircle size={14} className="text-teal-600 mx-auto" />
                        </div>
                        <div className="w-10"></div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gray-50/50 border-gray-200 opacity-75">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Standard Field</label>
                          <p className="text-sm font-bold text-gray-900">Category</p>
                        </div>
                        <div className="w-32">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Type</span>
                          <span className="text-xs text-gray-600 font-medium">Dropdown</span>
                        </div>
                        <div className="w-20 text-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Required</span>
                          <CheckCircle size={14} className="text-teal-600 mx-auto" />
                        </div>
                        <div className="w-10"></div>
                      </div>
                    </Card>

                    <div className="h-4 border-l-2 border-dashed border-gray-200 ml-8 my-2"></div>

                    {qFields.map((field, idx) => (
                      <Card key={field.id} className="p-6 space-y-4 relative group">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Field Label</label>
                            <Input 
                              placeholder="e.g. What device are you using?" 
                              value={field.label} 
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                            />
                          </div>
                          <div className="w-48">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
                            <Select 
                              value={field.type} 
                              onChange={(e) => updateField(field.id, { type: e.target.value })}
                            >
                              <option value="text">Short Text</option>
                              <option value="textarea">Long Text</option>
                              <option value="select">Dropdown</option>
                              <option value="upload">File Upload</option>
                            </Select>

                          </div>
                          <div className="flex flex-col items-center justify-center pt-6">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Required</label>
                            <input 
                              type="checkbox" 
                              checked={field.required} 
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="w-4 h-4 text-teal-600 rounded border-gray-300"
                            />
                          </div>
                          <div className="pt-6">
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => removeField(field.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>

                        {field.type === 'select' && (
                          <div className="animate-fade-in pt-4 border-t border-gray-50">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Options (Comma separated)</label>
                            <Input 
                              placeholder="e.g. iOS, Android, Web" 
                              value={field.options} 
                              onChange={(e) => updateField(field.id, { options: e.target.value })}
                            />
                          </div>
                        )}
                      </Card>
                    ))}

                    <Button variant="outline" className="w-full py-6 border-dashed" onClick={addField}>
                      <Plus size={16} /> Add Questionnaire Field
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
