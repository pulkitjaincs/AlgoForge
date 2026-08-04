import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useAuth';
import { usersApi } from '../api/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Link as LinkIcon, Camera, Save, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatarUrl: '',
    isProfilePublic: false
  });
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle');

  const checkUsername = async () => {
    if (!formData.username || formData.username === user?.username) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const res = await usersApi.checkUsername(formData.username) as any;
      setUsernameStatus(res.available ? 'available' : 'unavailable');
    } catch (e) {
      setUsernameStatus('error');
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        isProfilePublic: user.isProfilePublic || false
      });
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: (data: any) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-main">Profile Settings</h1>
        <p className="text-text-muted mt-1">Manage your account and public presence.</p>
      </div>
      
      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full bg-bg-elevated border border-border-dark object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-4xl font-bold border border-brand-primary/20">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
              <h2 className="text-xl font-bold text-text-main">{user.name}</h2>
              <p className="text-text-muted mb-3">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-text-muted">
                <div className="px-2 py-1 rounded bg-bg-elevated border border-border-dark">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border-dark w-full" />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <label className="input-label">Avatar URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              />
            </div>
            
            <div className="space-y-4">
              <label className="input-label">Username</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-text-muted">@</span>
                  </div>
                  <input
                    type="text"
                    className={`input-field pl-8 ${usernameStatus === 'available' ? 'border-success/50' : usernameStatus === 'unavailable' ? 'border-danger/50' : ''}`}
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      setUsernameStatus('idle');
                    }}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={checkUsername}
                  disabled={usernameStatus === 'checking' || !formData.username || formData.username === user?.username}
                  className="btn-secondary whitespace-nowrap"
                >
                  {usernameStatus === 'checking' ? 'Checking...' : 'Check Availability'}
                </button>
              </div>
              {usernameStatus === 'available' && <p className="text-sm text-success">Username is available!</p>}
              {usernameStatus === 'unavailable' && <p className="text-sm text-danger">Username is already taken.</p>}
              {usernameStatus === 'error' && <p className="text-sm text-danger">Error checking username.</p>}
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="input-label">Bio</label>
              <textarea
                className="input-field min-h-[100px] resize-none"
                placeholder="Tell us a little bit about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
            
            <div className="space-y-4 md:col-span-2 p-4 bg-bg-elevated border border-border-dark rounded-xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {formData.isProfilePublic ? <Globe className="w-4 h-4 text-brand-primary" /> : <Lock className="w-4 h-4 text-text-muted" />}
                  <h3 className="font-semibold text-text-main">Public Profile</h3>
                </div>
                <p className="text-sm text-text-muted">Allow others to see your stats, heatmap, and bio.</p>
                {formData.isProfilePublic && formData.username && (
                   <a href={`/u/${formData.username}`} target="_blank" rel="noreferrer" className="text-xs text-brand-primary hover:underline flex items-center gap-1 mt-2 w-fit">
                      <LinkIcon className="w-3 h-3" /> View public profile
                   </a>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.isProfilePublic}
                  onChange={(e) => setFormData({ ...formData, isProfilePublic: e.target.checked })}
                />
                <div className="w-11 h-6 bg-border-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-dark">
            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2"
              disabled={updateProfile.isPending}
            >
              <Save className="w-4 h-4" />
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
