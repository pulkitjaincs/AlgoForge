import { useState } from 'react';
import { useMyGroups, useCreateGroup, useJoinGroup } from '../hooks/useGroups';
import { Users, Plus, Hash, Copy, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Modal } from '../components/shared/Modal';
import { toast } from 'sonner';

export default function GroupsPage() {
  const { data: groups, isLoading } = useMyGroups();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup.mutate({ name: newGroupName }, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setNewGroupName('');
        toast.success('Group created successfully');
      }
    });
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    joinGroup.mutate({ inviteCode }, {
      onSuccess: () => {
        setIsJoinModalOpen(false);
        setInviteCode('');
        toast.success('Joined group successfully');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to join group');
      }
    });
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Invite code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <Helmet>
        <title>AlgoForge — Groups</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Study Groups</h1>
          <p className="text-text-muted mt-1">Learn together, share progress, and compete on leaderboards.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsJoinModalOpen(true)} className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2">
            <Hash className="w-4 h-4" /> Join Group
          </button>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-text-muted">Loading groups...</div>
      ) : groups?.length === 0 ? (
        <div className="glass text-center py-20 px-8 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
            <Users className="w-8 h-8 text-brand-primary" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">You aren't in any groups</h3>
          <p className="text-text-muted max-w-sm mx-auto mb-6">Create a group to invite friends or join an existing group with an invite code.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">Create Group</button>
            <button onClick={() => setIsJoinModalOpen(true)} className="btn-secondary">Join via Code</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups?.map((group: any) => (
            <div key={group.id} className="card p-6 flex flex-col hover:border-brand-primary/30 transition-all group/card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center border border-brand-primary/20 text-brand-primary font-bold text-xl">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-main group-hover/card:text-brand-primary transition-colors">{group.name}</h3>
                  <p className="text-xs text-text-muted">{group._count?.members || 1} Members</p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-bg-elevated px-2 py-1 rounded text-text-muted border border-border-dark">
                    Code: {group.inviteCode}
                  </span>
                  <button 
                    onClick={() => copyInviteCode(group.inviteCode)}
                    className="p-1.5 text-text-muted hover:text-text-main hover:bg-border-dark rounded transition-colors"
                    title="Copy invite code"
                  >
                    {copiedCode === group.inviteCode ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create a Group">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="input-label">Group Name</label>
            <input
              type="text"
              autoFocus
              className="input-field"
              placeholder="e.g. FAANG Study Buddies"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={createGroup.isPending} className="btn-primary w-full mt-4">
            {createGroup.isPending ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title="Join a Group">
        <form onSubmit={handleJoinGroup} className="space-y-4">
          <div>
            <label className="input-label">Invite Code</label>
            <input
              type="text"
              autoFocus
              className="input-field font-mono"
              placeholder="Enter code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={joinGroup.isPending} className="btn-primary w-full mt-4">
            {joinGroup.isPending ? 'Joining...' : 'Join Group'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
