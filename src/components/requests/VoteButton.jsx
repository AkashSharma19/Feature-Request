import { ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

export default function VoteButton({ featureId, votes, size = 'md' }) {
  const { toggleVote, votes: userVotes, user } = useStore();
  const navigate = useNavigate();
  const hasVoted = userVotes[featureId];

  const sizes = {
    sm: { btn: 'px-2 py-1 text-xs gap-1', icon: 11 },
    md: { btn: 'px-3 py-2 text-sm gap-1.5', icon: 14 },
    lg: { btn: 'px-4 py-2.5 text-sm gap-2', icon: 16 },
  };
  const s = sizes[size];

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!user) {
          navigate('/login');
          return;
        }
        toggleVote(featureId);
      }}
      className={cn(
        'flex flex-col items-center rounded-xl font-semibold border transition-all duration-200 cursor-pointer',
        hasVoted
          ? 'bg-teal-600 text-white border-teal-600 shadow-sm hover:bg-teal-700'
          : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50',
        s.btn
      )}
    >
      <ChevronUp size={s.icon} className={cn('transition-transform', hasVoted && '-translate-y-0.5')} />
      <span className="font-bold leading-none">{votes}</span>
      <span className="text-[9px] font-medium opacity-70">{hasVoted ? 'Voted' : 'Vote'}</span>
    </button>
  );
}
