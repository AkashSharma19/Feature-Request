import { useState } from 'react';
import { Mail, Bell, User, ArrowRight, ExternalLink, Send, CheckCircle, Clock, AlertTriangle, Zap, RefreshCw, Megaphone, MessageSquare } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { cn } from '../lib/utils';

const EMAIL_WORKFLOWS = [
  {
    id: 'req-created',
    trigger: 'New Request Submitted',
    recipient: 'Raiser',
    timing: 'Instant',
    description: 'Confirms we received the request and provides a tracking link.',
    status: 'Active'
  },
  {
    id: 'status-change',
    trigger: 'Status Changed',
    recipient: 'Raiser & Voters',
    timing: 'Instant',
    description: 'Notifies everyone following the feature about the new stage (e.g., In Development).',
    status: 'Active'
  },
  {
    id: 'action-needed',
    trigger: 'Action Needed Flagged',
    recipient: 'Raiser',
    timing: 'Instant',
    description: 'Urgent notification that the admin team needs more details to proceed.',
    status: 'Active'
  },
  {
    id: 'changelog-publish',
    trigger: 'Release Note Published',
    recipient: 'All Platform Users',
    timing: 'Scheduled or Instant',
    description: 'A beautiful summary of what is new in the product.',
    status: 'Active'
  },
  {
    id: 'internal-mention',
    trigger: 'Admin Mention (@name)',
    recipient: 'Internal Team',
    timing: 'Instant',
    description: 'Alerts other admins about an internal note or task assignment.',
    status: 'Draft'
  },
  {
    id: 'comment-reply',
    trigger: 'New Comment Reply',
    recipient: 'Original Commenter',
    timing: 'Instant',
    description: 'Notifies a user when someone joins the conversation they started.',
    status: 'Active'
  },
  {
    id: 'action-reverted',
    trigger: 'Admin Acknowledges Action',
    recipient: 'Raiser',
    timing: 'Instant',
    description: 'Sent when an admin replies back to a raiser after an action was cleared.',
    status: 'Active'
  }
];

const TEMPLATES = {
  'req-created': {
    subject: 'We got it! Your request is in the queue 🚀',
    preview: 'Hi {name}, thanks for helping us shape our future. We have received your request for {title}...',
    color: 'bg-teal-600',
    icon: CheckCircle
  },
  'status-change': {
    subject: 'Good news! {title} has moved to {status}',
    preview: 'Things are moving! We just updated the status of a feature you follow to {status}...',
    color: 'bg-indigo-600',
    icon: RefreshCw
  },
  'action-needed': {
    subject: 'Action Required: Quick question about your request',
    preview: 'Hi {name}, our product team is reviewing your request but needs a bit more info...',
    color: 'bg-orange-600',
    icon: AlertTriangle
  },
  'changelog-publish': {
    subject: 'New Release: See what we built last week!',
    preview: 'We have been busy! Check out the latest updates including {title} and more...',
    color: 'bg-purple-600',
    icon: Megaphone
  },
  'internal-mention': {
    subject: 'Internal Note: You were mentioned by {name}',
    preview: 'A colleague mentioned you in a private note on the request {title}...',
    color: 'bg-slate-700',
    icon: Bell
  },
  'comment-reply': {
    subject: 'New Reply: {name} commented on {title}',
    preview: 'You have a new reply on your comment! Check out what they had to say...',
    color: 'bg-blue-500',
    icon: MessageSquare
  },
  'action-reverted': {
    subject: 'Update: We have received your feedback on {title}',
    preview: 'Thanks for the info! We have received your response and are moving forward...',
    color: 'bg-green-600',
    icon: CheckCircle
  }
};

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState('Workflows');
  const [selectedTemplate, setSelectedTemplate] = useState('req-created');

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Manage automated communication workflows and templates.</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {['Workflows', 'Templates'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                activeTab === tab ? "bg-white text-teal-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Workflows' ? (
        <div className="grid grid-cols-1 gap-4">
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Trigger Event</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Recipient</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timing</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {EMAIL_WORKFLOWS.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                          <Zap size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{w.trigger}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{w.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                        <User size={10} /> {w.recipient}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} /> {w.timing}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        w.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-400 border-slate-200"
                      )}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedTemplate(w.id); setActiveTab('Templates'); }}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 underline underline-offset-4"
                      >
                        Edit Template
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Template Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            {Object.entries(TEMPLATES).map(([id, t]) => (
              <button
                key={id}
                onClick={() => setSelectedTemplate(id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all duration-200",
                  selectedTemplate === id 
                    ? "bg-white border-teal-500 shadow-md ring-4 ring-teal-500/5" 
                    : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm", t.color)}>
                    <t.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{t.subject}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{t.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Preview Canvas */}
          <div className="lg:col-span-8">
            <Card className="p-0 border-gray-200 overflow-hidden shadow-xl flex flex-col h-full min-h-[600px]">
              {/* Browser-like Header */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="bg-white px-3 py-1 rounded-md text-[10px] text-gray-400 w-64 text-center truncate">
                  email-preview.featureflow.com
                </div>
                <div className="w-10" />
              </div>

              {/* Email Content */}
              <div className="flex-1 bg-[#F9FAFB] p-8 overflow-y-auto">
                <div className="max-w-[520px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Email Banner */}
                  <div className={cn("h-2", TEMPLATES[selectedTemplate].color)} />
                  
                  <div className="p-8">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                      <Zap size={20} className="text-white" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {TEMPLATES[selectedTemplate].subject.replace('{title}', 'Dark Mode Support')}
                    </h2>

                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                      <p>Hi Akash,</p>
                      <p>
                        {selectedTemplate === 'req-created' && "Great ideas deserve to be heard! We've received your request for **Dark Mode Support** and added it to our review queue."}
                        {selectedTemplate === 'status-change' && "Good news! The feature you follow, **Dark Mode Support**, has just been moved to **In Development**. We are officially building it!"}
                        {selectedTemplate === 'action-needed' && "Our product team is currently reviewing **Dark Mode Support**, but we need a bit more information to properly scope the requirements."}
                        {selectedTemplate === 'changelog-publish' && "We have been busy building! Check out our latest release notes to see what is new this week."}
                        {selectedTemplate === 'internal-mention' && "You've been mentioned in an internal note regarding **Dark Mode Support**. Please check the admin dashboard for details."}
                        {selectedTemplate === 'comment-reply' && "Akash Sharma just replied to your comment on **Dark Mode Support**. Click below to join the discussion."}
                        {selectedTemplate === 'action-reverted' && "Thanks for the quick response! We've received the information you provided for **Dark Mode Support** and our team is now moving forward with the review."}
                      </p>
                      
                      {selectedTemplate === 'action-needed' && (
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 font-medium">
                          "Could you please clarify if you expect dark mode on the mobile app as well, or just the web dashboard?"
                        </div>
                      )}

                      <div className="py-4">
                        <button className={cn(
                          "w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98]",
                          TEMPLATES[selectedTemplate].color
                        )}>
                          View Details in Dashboard
                        </button>
                      </div>

                      <p>
                        Best regards,<br />
                        <span className="font-bold text-gray-900">Team Coach</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
                <p className="text-[10px] text-gray-400 font-medium">Rendered using <span className="text-teal-600 font-bold">MJML Engine v4.2</span></p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    <ExternalLink size={12} /> Send Test
                  </Button>
                  <Button variant="primary" size="sm">
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
