import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Archive, Trash2, Pin, ChevronDown,
  Calendar, User, Tag, Target, AlertCircle, Check, X,
  RefreshCw, ExternalLink, Settings, Paperclip, Megaphone
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  StatusBadge, ProgressBar, Button, Card, Select, Modal, Textarea, Input
} from '../components/ui';
import VoteButton from '../components/requests/VoteButton';
import ActivityTimeline from '../components/requests/ActivityTimeline';
import CommentsSection from '../components/requests/CommentsSection';
import CreateRequestModal from '../components/requests/CreateRequestModal';
import { fetchClickUpTask } from '../lib/clickup';
import { formatDate, STATUSES, ASSIGNEES, cn } from '../lib/utils';
import { useAdmin } from '../lib/useAdmin';

const TABS = ['Overview', 'Comments', 'Activity'];

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-700 font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

function CancelModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">Cancel Feature Request</h3>
        <p className="text-sm text-gray-400 mb-4">Provide a reason for cancellation (optional but recommended).</p>
        <Textarea
          rows={4}
          placeholder="e.g. Out of scope for current roadmap, duplicates FR-008…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => { onConfirm(reason); onClose(); }} className="flex-1">
            <X size={14} /> Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ReleaseNoteModal({ open, onClose, onConfirm, defaultValues }) {
  const [title, setTitle] = useState(defaultValues?.title || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [link, setLink] = useState(defaultValues?.link || '');

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Add to Changelogs</h3>
        <p className="text-sm text-gray-500 mb-4">Publish this feature to the public changelog.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Release Note Title"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <Textarea
              rows={4}
              placeholder="Write the release notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Support Doc Link (Optional)</label>
            <Input 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://support.example.com/..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => {
            onConfirm({ title, description, link });
            onClose();
          }}>
            Publish Release Note
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, updateRequest, deleteRequest, togglePin, clickupSettings, setClickupSettings } = useStore();
  const request = requests.find((r) => r.id === id);
  const isAdmin = useAdmin();

  const [activeTab, setActiveTab] = useState('Overview');
  const [showEdit, setShowEdit] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReleaseNote, setShowReleaseNote] = useState(false);
  const [showClickupSettings, setShowClickupSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [noteEdit, setNoteEdit] = useState(false);
  const [noteVal, setNoteVal] = useState(request?.internalNote || '');
  const [progressEdit, setProgressEdit] = useState(false);
  const [progressVal, setProgressVal] = useState(request?.progress ?? 0);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32">
        <p className="text-gray-500 font-medium text-lg">Request not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-600 mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* Action Needed Banner */}
      {request.actionNeeded && (
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl flex items-start gap-3 shadow-sm animate-fade-in">
          <AlertCircle className="text-orange-600 mt-0.5" size={18} />
          <div>
            <h3 className="text-sm font-bold text-orange-800">Action Needed</h3>
            <p className="text-xs text-orange-700 mt-1">
              The admin team has requested more information or action from you. Please review the comments and reply below. Your reply will automatically clear this status.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left / Main ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              {/* Vote */}
              <VoteButton featureId={request.id} votes={request.votes} size="lg" />

              {/* Title + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{request.title}</h1>
                  <div className="flex gap-2 flex-shrink-0">
                    {isAdmin && (
                      <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
                        <Edit2 size={12} /> Edit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePin(request.id)}
                      className={request.pinned ? 'text-teal-600 bg-teal-50' : ''}
                    >
                      <Pin size={12} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <StatusBadge status={request.status} />
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {request.category}
                  </span>
                  {request.pinned && (
                    <span className="text-xs text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                </div>

                {/* Status & Assignee changer */}
                {isAdmin && (
                  <div className="mt-4 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400">Status:</span>
                      <Select
                        value={request.status}
                        onChange={(e) => updateRequest(request.id, { status: e.target.value })}
                        className="w-40 text-xs py-1"
                      >
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </Select>
                      
                      {request.clickupTaskId && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            setIsSyncing(true);
                            try {
                              const res = await fetchClickUpTask(request.clickupTaskId, clickupSettings.apiKey, clickupSettings.teamId);
                              if (res) {
                                if (res.status) {
                                  updateRequest(request.id, { status: res.status, updatedBy: 'ClickUp' });
                                  alert(`Synced! ClickUp Status: ${res.originalStatus} -> Local Status: ${res.status}`);
                                } else {
                                  alert(`Connected to ClickUp, but the status "${res.originalStatus}" doesn't have a match in this app. Please update it manually.`);
                                }
                              }
                            } catch (error) {
                              alert(`Failed to sync: ${error.message}`);
                            }
                            setIsSyncing(false);
                          }}
                          disabled={isSyncing || !clickupSettings.apiKey}
                          className="h-[30px]"
                        >
                          <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                          Sync ClickUp
                        </Button>
                      )}
                      
                      {!clickupSettings.apiKey && request.clickupTaskId && (
                        <button 
                          onClick={() => setShowClickupSettings(true)}
                          className="text-[10px] text-teal-600 hover:underline flex items-center gap-1"
                        >
                          <Settings size={10} /> Configure API Key
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400">Assign To:</span>
                      <Select
                        value={request.assignee || 'Unassigned'}
                        onChange={(e) => updateRequest(request.id, { assignee: e.target.value })}
                        className="w-40 text-xs py-1"
                      >
                        {ASSIGNEES.map((a) => <option key={a}>{a}</option>)}
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Development Progress</span>
                {isAdmin && progressEdit ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-teal-600">{progressVal}%</span>
                    <button onClick={() => { updateRequest(request.id, { progress: progressVal }); setProgressEdit(false); }}
                      className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700">
                      <Check size={10} />
                    </button>
                    <button onClick={() => { setProgressVal(request.progress); setProgressEdit(false); }}
                      className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300">
                      <X size={10} />
                    </button>
                  </div>
                ) : isAdmin ? (
                  <button
                    onClick={() => { setProgressVal(request.progress); setProgressEdit(true); }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    {request.progress}% · Edit
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">
                    {request.progress}%
                  </span>
                )}
              </div>
              {isAdmin && progressEdit ? (
                <input
                  type="range" min="0" max="100" value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              ) : (
                <ProgressBar value={request.progress} />
              )}
            </div>
          </Card>

          {/* Tabs */}
          <Card>
            <div className="border-b border-gray-100 px-6">
              <div className="flex gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-3 text-sm font-semibold border-b-2 transition-all',
                      activeTab === tab
                        ? 'border-teal-600 text-teal-700'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'Overview' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</h3>
                    <div 
                      className="prose prose-teal max-w-none text-sm text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: request.description }}
                    />
                  </div>
                  {request.problem && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Problem It Solves</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{request.problem}</p>
                    </div>
                  )}
                  {request.impact && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Expected Impact</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{request.impact}</p>
                    </div>
                  )}
                  {request.attachments?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Attachments ({request.attachments.length})</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {request.attachments.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-teal-100 transition-all group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-teal-600">
                                <Paperclip size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
                                <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <a 
                              href={file.url} 
                              download 
                              onClick={(e) => { e.preventDefault(); alert('In this demo, file downloads are simulated.'); }}
                              className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-600 hover:shadow-sm transition-all"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {request.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Cancellation Reason</p>
                      <p className="text-sm text-red-700">{request.rejectionReason}</p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="pt-5 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wide flex items-center gap-1.5">
                          <AlertCircle size={12} /> Internal Admin Note
                        </h3>
                        {!noteEdit ? (
                          <button 
                            onClick={() => { setNoteVal(request.internalNote || ''); setNoteEdit(true); }}
                            className="text-[10px] font-bold text-gray-400 hover:text-teal-600 uppercase tracking-wider"
                          >
                            Edit Note
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => { updateRequest(request.id, { internalNote: noteVal }); setNoteEdit(false); }}
                              className="text-[10px] font-bold text-teal-600 uppercase tracking-wider"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setNoteEdit(false)}
                              className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {noteEdit ? (
                        <Textarea
                          rows={4}
                          placeholder="Add private team notes here..."
                          value={noteVal || ''}
                          onChange={(e) => setNoteVal(e.target.value)}
                          className="text-sm border-teal-100 focus:ring-teal-500/10"
                        />
                      ) : (
                        <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100/50">
                          <p className="text-sm text-gray-600 italic">
                            {request.internalNote || 'No internal notes added yet.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'Comments' && (
                <div className="animate-fade-in">
                  <CommentsSection featureId={request.id} />
                </div>
              )}
              {activeTab === 'Activity' && (
                <div className="animate-fade-in">
                  <ActivityTimeline activities={request.activityLog || []} />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right / Sidebar ── */}
        <div className="space-y-4">
          {/* Details */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Details</h3>
            <div className="space-y-3">
              <InfoRow icon={User} label="Assignee" value={request.assignee || 'Unassigned'} />
              <InfoRow icon={Calendar} label="By when you need this?" value={formatDate(request.dueDate)} />
              
              {/* Confirmed Deadline (Admin Editable) */}
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Confirmed Deadline</p>
                  {isAdmin ? (
                    <input
                      type="date"
                      value={request.deadline || ''}
                      onChange={(e) => updateRequest(request.id, { deadline: e.target.value })}
                      className="text-xs font-semibold text-gray-900 bg-transparent border-b border-dashed border-gray-200 focus:border-teal-500 outline-none w-full py-0.5 hover:border-gray-300 transition-colors"
                    />
                  ) : (
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {formatDate(request.deadline)}
                    </p>
                  )}
                </div>
              </div>

              <InfoRow icon={Calendar} label="Created" value={formatDate(request.createdAt)} />
              <InfoRow icon={Target} label="Category" value={request.category} />
            </div>
          </Card>

          {/* Tags */}
          {request.tags && request.tags.length > 0 && (
            <Card className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {request.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2.5 py-0.5 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Admin Actions */}
          {isAdmin && (
            <Card className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Admin Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setShowEdit(true)}>
                  <Edit2 size={13} /> Edit Request
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => togglePin(request.id)}
                >
                  <Pin size={13} /> {request.pinned ? 'Unpin Request' : 'Pin Request'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-indigo-600 hover:bg-indigo-50"
                  onClick={() => {
                    if (request.isReleaseNote) {
                      updateRequest(request.id, { isReleaseNote: false });
                    } else {
                      setShowReleaseNote(true);
                    }
                  }}
                >
                  <Megaphone size={13} /> {request.isReleaseNote ? 'Remove from Changelog' : 'Add to Changelog'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                  onClick={() => setShowCancel(true)}
                >
                  <X size={13} /> Cancel Request
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                  onClick={() => { deleteRequest(request.id); navigate(isAdmin ? '/admin' : '/'); }}
                >
                  <Trash2 size={13} /> Delete Request
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateRequestModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        editData={request}
      />
      <CancelModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={(reason) => updateRequest(request.id, { status: 'Cancelled', rejectionReason: reason })}
      />
      <ReleaseNoteModal
        open={showReleaseNote}
        onClose={() => setShowReleaseNote(false)}
        defaultValues={{
          title: request.releaseNoteTitle || request.title,
          description: request.releaseNoteDescription || request.description,
          link: request.releaseNoteLink || ''
        }}
        onConfirm={(data) => {
          updateRequest(request.id, {
            isReleaseNote: true,
            releaseNoteDate: new Date().toISOString(),
            releaseNoteTitle: data.title,
            releaseNoteDescription: data.description,
            releaseNoteLink: data.link
          });
        }}
      />

      <Modal open={showClickupSettings} onClose={() => setShowClickupSettings(false)} title="ClickUp Integration Settings">
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">ClickUp API Configuration</h3>
          <p className="text-xs text-gray-500">Enter your ClickUp Personal API Token to enable status synchronization.</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Personal API Token</label>
              <Input 
                type="password"
                placeholder="pk_..."
                value={clickupSettings?.apiKey || ''}
                onChange={(e) => setClickupSettings({ apiKey: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Workspace ID (Optional)</label>
              <Input 
                placeholder="Required for custom task IDs (e.g. 1234567)"
                value={clickupSettings?.teamId || ''}
                onChange={(e) => setClickupSettings({ teamId: e.target.value })}
              />
              <p className="text-[10px] text-gray-400 mt-1">Needed if your ClickUp tasks use custom IDs (like PROJ-123)</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="primary" onClick={() => setShowClickupSettings(false)}>
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
