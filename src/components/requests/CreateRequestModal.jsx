import { useState, useEffect } from 'react';
import { X, Paperclip, Save, Send } from 'lucide-react';
import { Modal, Button, Input, Textarea, Select, RichTextEditor } from '../ui';
import { useStore } from '../../store/useStore';
import { CATEGORIES, cn } from '../../lib/utils';
import { useAdmin } from '../../lib/useAdmin';
import { AlertTriangle, ChevronRight, Vote } from 'lucide-react';

const PLATFORMS = ['Coach LMS', 'Career Coach', 'Coach Resume'];

const INITIAL = {
  platform: 'Coach LMS',
  title: '',
  description: '',
  problem: '',
  impact: '',
  category: 'Feature Request',
  requestedBy: 'Admin User',
  owner: '',
  status: 'Open',
  dueDate: '',
  deadline: '',
  clickupTaskId: '',
  attachments: [],
};

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function CreateRequestModal({ open, onClose, editData = null }) {
  const { addRequest, updateRequest, requests, toggleVote, votes } = useStore();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [similarRequests, setSimilarRequests] = useState([]);
  const isAdmin = useAdmin();

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          ...INITIAL,
          ...editData,
          attachments: editData.attachments || []
        });
      } else {
        setForm(INITIAL);
      }
      setSimilarRequests([]);
    }
  }, [open, editData]);

  const isEdit = !!editData;

  useEffect(() => {
    if (!isEdit && form.title.length > 3) {
      const query = form.title.toLowerCase();
      const matches = requests
        .filter(r => r.title.toLowerCase().includes(query))
        .slice(0, 3);
      setSimilarRequests(matches);
    } else {
      setSimilarRequests([]);
    }
  }, [form.title, requests, isEdit]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (status) => {
    if (!validate()) return;
    if (isEdit) {
      updateRequest(editData.id, { ...form, status: status === 'draft' ? 'Open' : form.status });
    } else {
      addRequest({ ...form, status: status === 'draft' ? 'Open' : 'Open' });
    }
    handleClose();
  };

  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? 'Edit Feature Request' : 'New Feature Request'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Fill in the details below to {isEdit ? 'update' : 'submit'} your request</p>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">
        {/* Platform */}
        <Field label="Platform" required>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set('platform', p)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  form.platform === p
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        {/* Category */}
        <Field label="Category">
          <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>

        {/* Title */}
        <Field label="Feature Title" required>
          <Input
            placeholder="e.g. Dark mode support for all screens"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={errors.title ? 'border-red-400 focus:border-red-400' : ''}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}

          {similarRequests.length > 0 && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-xl animate-fade-in">
              <div className="flex items-center gap-2 text-orange-700 font-bold text-xs mb-2">
                <AlertTriangle size={14} />
                Similar requests already exist
              </div>
              <div className="space-y-2">
                {similarRequests.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-orange-100/50 shadow-sm">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[11px] font-semibold text-gray-800 truncate">{r.title}</p>
                      <p className="text-[10px] text-gray-500">{r.votes} votes • {r.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleVote(r.id)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all",
                        votes[r.id] ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-teal-50"
                      )}
                    >
                      <ChevronRight size={10} />
                      Upvote
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-orange-600 mt-2 italic">Consider upvoting these instead of creating a duplicate.</p>
            </div>
          )}
        </Field>

        {/* Description */}
        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(val) => set('description', val)}
            placeholder="Describe the feature in detail…"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </Field>

        {/* Problem + Impact */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Problem It Solves">
            <Textarea
              rows={3}
              placeholder="What pain point does this address?"
              value={form.problem}
              onChange={(e) => set('problem', e.target.value)}
            />
          </Field>
          <Field label="Expected Impact">
            <Textarea
              rows={3}
              placeholder="Estimated business / user impact…"
              value={form.impact}
              onChange={(e) => set('impact', e.target.value)}
            />
          </Field>
        </div>

        {/* Dates & Status */}
        <div className={cn("grid gap-4", isEdit && !isAdmin ? "grid-cols-2" : "grid-cols-1")}>
          <Field label="By when you need this?">
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </Field>

          {isEdit && !isAdmin && (
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                {['Open', 'In Progress', 'In Design', 'Under Review', 'Development', 'Testing', 'Tested', 'Closed', 'Cancelled'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
          )}
        </div>

        {/* ClickUp Integration */}
        <Field label="ClickUp Task ID (Optional)">
          <div className="relative">
            <Input
              placeholder="e.g. 867xhzabc"
              value={form.clickupTaskId || ''}
              onChange={(e) => set('clickupTaskId', e.target.value)}
              className="pl-9"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-teal-600 rounded flex items-center justify-center text-[8px] font-bold text-white">
              CU
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Link this request to a ClickUp task for status syncing</p>
        </Field>

        {/* Attachments */}
        <Field label="Attachments">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            multiple 
            onChange={(e) => {
              const files = Array.from(e.target.files).map(f => ({
                id: `att-${Date.now()}-${f.name}`,
                name: f.name,
                size: f.size,
                type: f.type,
                url: '#', // Mock URL
              }));
              set('attachments', [...form.attachments, ...files]);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <label 
              htmlFor="file-upload"
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-100 hover:border-teal-300 hover:text-teal-600 cursor-pointer transition-all"
            >
              <Paperclip size={14} /> Add Files
            </label>
            {(form.attachments || []).map((file) => (
              <div key={file.id} className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-100 rounded-xl text-xs font-medium text-teal-700">
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button onClick={() => set('attachments', (form.attachments || []).filter(f => f.id !== file.id))}>
                  <X size={12} className="hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </Field>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => handleSubmit('submitted')}>
          <Send size={15} />
          {isEdit ? 'Update Request' : 'Submit Request'}
        </Button>
      </div>
    </Modal>
  );
}
