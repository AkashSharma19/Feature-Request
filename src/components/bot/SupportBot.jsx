import React, { useState } from 'react';
import { MessageSquare, X, Send, List, Sparkles, ChevronRight, Zap, Check, Paperclip, Camera } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../ui';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const INITIAL_FORM = {
  platform: 'Hand Shake',
  title: '',
  description: '',
  problem: '',
  impact: '',
  category: 'Feature Request',
  dueDate: '',
  clickupTaskId: '',
  attachments: []
};

export default function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('choice'); // 'choice', 'form', 'success'
  const { addRequest } = useStore();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(INITIAL_FORM);
  const [isCapturing, setIsCapturing] = useState(false);

  const takeScreenshot = async () => {
    setIsCapturing(true);
    setIsOpen(false); // Hide bot so it doesn't block the screen
    
    // Wait for bot to animate out
    setTimeout(async () => {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(document.body, {
          useCORS: true,
          logging: false
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
            const mockAtt = {
              id: `att-${Date.now()}-screenshot`,
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(blob)
            };
            set('attachments', [...(form.attachments || []), mockAtt]);
          }
          setIsOpen(true);
          setIsCapturing(false);
        });
      } catch (err) {
        console.error("Screenshot failed:", err);
        setIsOpen(true);
        setIsCapturing(false);
      }
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    
    addRequest({
      ...form,
      status: 'Open',
      requestedBy: 'Guest User'
    });
    setStep('success');
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Bot Window */}
      {isOpen && (
        <div className="mb-4 w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up flex flex-col h-[600px]">
          {/* Header */}
          <div className="bg-teal-600 p-6 text-white relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Hand Shake Bot</h3>
                  <p className="text-xs text-teal-100">Synchronized with Roadmap</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1.5 rounded-lg transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {step === 'choice' && (
              <div className="space-y-4 animate-fade-in text-left">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Hello! 👋 I'm here to help you improve our platform. What would you like to do today?
                  </p>
                </div>
                
                <div className="grid gap-3">
                  <button 
                    onClick={() => setStep('basic')}
                    className="flex items-center justify-between p-4 bg-white hover:bg-teal-50 border border-gray-100 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Request a Feature</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-teal-500" />
                  </button>

                  <button 
                    onClick={() => { setIsOpen(false); navigate('/dashboard'); }}
                    className="flex items-center justify-between p-4 bg-white hover:bg-teal-50 border border-gray-100 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <List size={16} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">View All Requests</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-teal-500" />
                  </button>
                </div>
              </div>
            )}

            {step === 'basic' && (
              <div className="space-y-4 animate-fade-in text-left">
                <button onClick={() => setStep('choice')} className="text-xs text-gray-400 hover:text-teal-600 flex items-center gap-1">
                  <ChevronRight size={12} className="rotate-180" /> Back to menu
                </button>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">Let's start with the basics. Which platform is this for and what's the idea?</p>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Platform</label>
                  <div className="flex gap-2">
                    {['Hand Shake', 'Career Guide', 'Resume Pro'].map(p => (
                      <button
                        key={p}
                        onClick={() => set('platform', p)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all",
                          form.platform === p ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Title</label>
                  <Input 
                    placeholder="e.g. Dark Mode"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Category</label>
                  <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {['Bug', 'Feature Request', 'Data Needed', 'Term Report/ Transcript'].map(c => <option key={c}>{c}</option>)}
                  </Select>
                </div>

                <Button variant="primary" className="w-full" onClick={() => setStep('details')} disabled={!form.title}>
                  Next: Details <ChevronRight size={14} />
                </Button>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-4 animate-fade-in text-left">
                <button onClick={() => setStep('basic')} className="text-xs text-gray-400 hover:text-teal-600 flex items-center gap-1">
                  <ChevronRight size={12} className="rotate-180" /> Back
                </button>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Description</label>
                  <Textarea 
                    placeholder="Describe the feature..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Problem It Solves</label>
                  <Textarea 
                    placeholder="Pain point..."
                    rows={2}
                    value={form.problem}
                    onChange={(e) => set('problem', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Expected Impact</label>
                  <Textarea 
                    placeholder="Impact..."
                    rows={2}
                    value={form.impact}
                    onChange={(e) => set('impact', e.target.value)}
                  />
                </div>

                <Button variant="primary" className="w-full" onClick={() => setStep('extra')} disabled={!form.description}>
                  Next: Date & More <ChevronRight size={14} />
                </Button>
              </div>
            )}

            {step === 'extra' && (
              <div className="space-y-4 animate-fade-in text-left">
                <button onClick={() => setStep('details')} className="text-xs text-gray-400 hover:text-teal-600 flex items-center gap-1">
                  <ChevronRight size={12} className="rotate-180" /> Back
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">By when you need this?</label>
                    <Input 
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => set('dueDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">ClickUp ID</label>
                    <Input 
                      placeholder="Optional"
                      value={form.clickupTaskId}
                      onChange={(e) => set('clickupTaskId', e.target.value)}
                    />
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attachments</label>
                  
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      id="bot-file-upload" 
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
                        set('attachments', [...(form.attachments || []), ...files]);
                      }}
                    />
                    <label 
                      htmlFor="bot-file-upload"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-100 hover:border-teal-300 hover:text-teal-600 cursor-pointer transition-all"
                    >
                      <Paperclip size={14} /> Upload
                    </label>
                    <button
                      onClick={takeScreenshot}
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 border border-dashed border-teal-200 rounded-xl text-xs font-medium text-teal-600 hover:bg-teal-100 hover:border-teal-300 cursor-pointer transition-all"
                    >
                      <Camera size={14} /> {isCapturing ? 'Capturing...' : 'Screenshot'}
                    </button>
                  </div>

                  {/* Attached files list */}
                  {(form.attachments || []).length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 max-h-[100px] overflow-y-auto">
                      {form.attachments.map(file => (
                        <div key={file.id} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-700 shadow-sm">
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <button onClick={() => set('attachments', form.attachments.filter(f => f.id !== file.id))}>
                            <X size={12} className="text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button variant="primary" className="w-full h-12" onClick={handleSubmit}>
                  <Send size={16} /> Submit Request
                </Button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8 animate-fade-in text-left flex flex-col items-center">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Request Received!</h4>
                <p className="text-sm text-gray-500 mb-6 text-center">Thank you for helping us grow. Our team will review this shortly.</p>
                <Button variant="secondary" className="w-full" onClick={() => { setStep('choice'); setForm(INITIAL_FORM); }}>
                  Need anything else?
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-center">
            <p className="text-[10px] text-gray-300">Powered by Hand Shake AI</p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen ? "bg-white text-teal-600" : "bg-teal-600 text-white"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}

