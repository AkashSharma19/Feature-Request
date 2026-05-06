import { User, Zap } from 'lucide-react';
import { Card, Switch } from '../components/ui';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const EMAIL_WORKFLOWS = [
  {
    id: 'req-created',
    trigger: 'New Request Submitted',
    recipient: 'Raiser',
    description: 'Confirms we received the request and provides a tracking link.',
  },
  {
    id: 'status-change',
    trigger: 'Status Changed',
    recipient: 'Raiser & Voters',
    description: 'Notifies everyone following the feature about the new stage (e.g., In Development).',
  },
  {
    id: 'action-needed',
    trigger: 'Action Needed Flagged',
    recipient: 'Raiser',
    description: 'Urgent notification that the admin team needs more details to proceed.',
  },
  {
    id: 'changelog-publish',
    trigger: 'Release Note Published',
    recipient: 'All Platform Users',
    description: 'A beautiful summary of what is new in the product.',
  },
  {
    id: 'internal-mention',
    trigger: 'Admin Mention (@name)',
    recipient: 'Internal Team',
    description: 'Alerts other admins about an internal note or task assignment.',
  },
  {
    id: 'comment-reply',
    trigger: 'New Comment Reply',
    recipient: 'Original Commenter',
    description: 'Notifies a user when someone joins the conversation they started.',
  },
  {
    id: 'action-reverted',
    trigger: 'Admin Acknowledges Action',
    recipient: 'Raiser',
    description: 'Sent when an admin replies back to a raiser after an action was cleared.',
  }
];

export default function EmailsPage({ hideHeader = false }) {
  const { notificationSettings, updateNotificationSettings } = useStore();

  const handleToggle = async (id, enabled) => {
    try {
      await updateNotificationSettings({
        [id]: enabled
      });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
    }
  };

  return (
    <div className={cn(hideHeader ? "" : "p-6 max-w-6xl mx-auto animate-fade-in")}>
      {!hideHeader && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Email Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Automatic communication workflows triggered by app events.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Card className="overflow-hidden border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trigger Event</th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recipient</th>
                <th className="text-right px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {EMAIL_WORKFLOWS.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{w.trigger}</p>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-md">{w.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                      <User size={12} className="text-gray-400" /> {w.recipient}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Switch 
                      checked={notificationSettings[w.id] !== false} // Default to true if not set
                      onChange={(checked) => handleToggle(w.id, checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

    </div>
  );
}

