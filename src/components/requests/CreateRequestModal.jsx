import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Paperclip, Save, Send, AlertTriangle, ChevronRight, Layout, Upload } from 'lucide-react';
import { Modal, Button, Input, Textarea, Select, RichTextEditor } from '../ui';
import { useStore } from '../../store/useStore';
import { CATEGORIES, cn } from '../../lib/utils';
import { useAdmin } from '../../lib/useAdmin';
import toast from 'react-hot-toast';

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
  boardId: null,
  responses: {}, // Dynamic questionnaire answers
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

export default function CreateRequestModal({ open, onClose, editData = null, forcedBoardId = null }) {
  const { orgId: urlOrgId } = useParams();
  const { addRequest, updateRequest, requests, toggleVote, votes, boards, questionnaires, user, userOrg } = useStore();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [similarRequests, setSimilarRequests] = useState([]);
  const isAdmin = useAdmin();

  // Load questionnaire for active board
  const activeBoardId = forcedBoardId || form.boardId;
  const activeBoard = boards.find(b => b.id === activeBoardId);
  const fields = questionnaires[activeBoardId] || [];

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          ...INITIAL,
          ...editData,
          attachments: editData.attachments || []
        });
      } else {
        // Default to the first available board if not forced
        const defaultBoardId = forcedBoardId || (boards.length > 0 ? boards[0].id : null);
        setForm({ ...INITIAL, boardId: defaultBoardId });
      }
      setSimilarRequests([]);
    }
  }, [open, editData, forcedBoardId, boards]);


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

  const setResponse = (fieldId, val) => {
    setForm(f => ({
      ...f,
      responses: { ...f.responses, [fieldId]: val }
    }));
  };

  const validate = () => {
    const e = {};
    
    // Core fields are always required
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    
    // Validate required questionnaire fields
    fields.forEach(f => {
      if (f.required && !form.responses[f.id]) {
        e[f.id] = `${f.label} is required`;
      }
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const finalData = { 
        ...form, 
        orgId: urlOrgId || userOrg?.id,
        boardId: activeBoardId || form.boardId,
        status: isEdit ? form.status : 'Open',
        requestedBy: isEdit ? form.requestedBy : (user?.displayName || user?.email || 'User'),
        userId: user?.uid || null
      };

      if (isEdit) {
        await updateRequest(editData.id, finalData);
        toast.success('Request updated successfully!');
      } else {
        await addRequest(finalData);
        toast.success('Feature request submitted!');
      }
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="flex items-center gap-3">
          {activeBoard && (
            <div className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center">
              <Layout size={16} />
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? 'Edit Request' : activeBoard ? `Submit to ${activeBoard.name}` : 'New Feature Request'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeBoard ? `Help us improve ${activeBoard.name}` : 'Fill in the details below'}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
        
        {/* Core Fields (Always Visible) */}
        <div className="space-y-5">
          <Field label="Short Summary / Title" required>
            <Input
              placeholder="Give your feedback a clear title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={errors.title ? 'border-red-400 focus:border-red-400' : ''}
            />
            {errors.title && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.title}</p>}
          </Field>

          {isAdmin && !forcedBoardId && boards.length > 0 && (
            <Field label="Target Board (Optional)">
              <Select
                value={form.boardId || ''}
                onChange={(e) => set('boardId', e.target.value)}
              >
                <option value="">No Board (Main Feed Only)</option>
                {boards.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
              <p className="text-[10px] text-gray-400 mt-1">Choose which board this request belongs to.</p>
            </Field>
          )}

          <Field label="Category" required>
            <Select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </Field>

          <Field label="Detailed Context" required>
            <RichTextEditor
              value={form.description}
              onChange={(val) => set('description', val)}
              placeholder="Provide more details here…"
            />
            {errors.description && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.description}</p>}
          </Field>

        </div>

        {/* Dynamic Questionnaire Fields */}
        {fields.length > 0 && (
          <div className="space-y-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-2">Additional Information</p>
            {fields.map(f => (
              <Field key={f.id} label={f.label} required={f.required}>
                {f.type === 'text' && (
                  <Input 
                    value={form.responses[f.id] || ''} 
                    onChange={(e) => setResponse(f.id, e.target.value)}
                    placeholder="Type your answer..."
                  />
                )}
                {f.type === 'textarea' && (
                  <Textarea 
                    value={form.responses[f.id] || ''} 
                    onChange={(e) => setResponse(f.id, e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                  />
                )}
                {f.type === 'select' && (
                  <Select 
                    value={form.responses[f.id] || ''} 
                    onChange={(e) => setResponse(f.id, e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {f.options.split(',').map(opt => (
                      <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                    ))}
                  </Select>
                )}
                {f.type === 'upload' && (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-4 bg-white border border-dashed border-gray-200 rounded-xl text-xs font-medium text-gray-500 hover:border-gray-900 hover:text-gray-900 cursor-pointer transition-all">
                      <Upload size={14} /> {form.responses[f.id] ? 'File Attached' : 'Click to Upload'}
                      <input type="file" className="hidden" onChange={(e) => setResponse(f.id, e.target.files[0]?.name || '')} />
                    </label>
                    {form.responses[f.id] && <p className="text-[10px] text-gray-900 font-bold italic">File: {form.responses[f.id]}</p>}
                  </div>
                )}
                {errors[f.id] && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors[f.id]}</p>}
              </Field>
            ))}
          </div>
        )}


        {/* Similar Requests */}
        {similarRequests.length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-[10px] uppercase tracking-wider mb-2">
              <AlertTriangle size={14} /> Similar items already exist
            </div>
            <div className="space-y-2">
              {similarRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-orange-100/50 shadow-sm">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{r.title}</p>
                    <p className="text-[10px] text-gray-500">{r.votes} votes • {r.status}</p>
                  </div>
                  <button type="button" onClick={() => toggleVote(r.id)} className={cn("px-2 py-1 rounded-md text-[10px] font-bold transition-all", votes[r.id] ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600")}>
                    Upvote
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={() => handleSubmit('submitted')}>
          <Send size={15} /> {isEdit ? 'Update' : 'Submit Feedback'}
        </Button>
      </div>
    </Modal>
  );
}
