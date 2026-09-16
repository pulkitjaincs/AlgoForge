import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';
import { useUpdateEmail, useUpdatePassword } from '../hooks/useSettings';
import { useRequestExport } from '../hooks/useExport';
import { Settings as SettingsIcon, Mail, Lock, ArrowLeft, Download } from 'lucide-react';

export default function SettingsPage() {
  const { data: user } = useUser();
  const updateEmail = useUpdateEmail();
  const updatePassword = useUpdatePassword();
  const requestExport = useRequestExport();

  const [email, setEmail] = useState(user?.email || '');
  
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage({ type: '', text: '' });
    updateEmail.mutate({ email }, {
      onSuccess: () => {
        setEmailMessage({ type: 'success', text: 'Email updated successfully.' });
      },
      onError: (err: any) => {
        setEmailMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update email.' });
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    updatePassword.mutate({ currentPassword, newPassword }, {
      onSuccess: () => {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
      onError: (err: any) => {
        setPasswordMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password.' });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">Account Settings</h1>
            <p className="text-text-muted">Manage your security and account credentials</p>
          </div>
        </div>
        <Link
          to="/app/profile"
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile</span>
        </Link>
      </div>

      <div className="bg-bg-card border border-border-main rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-text-main">Change Email</h2>
        </div>
        <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-md">
          {emailMessage.text && (
            <div className={`p-3 rounded-md text-sm ${emailMessage.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
              {emailMessage.text}
            </div>
          )}
          <div>
            <label className="input-label">New Email Address</label>
            <input 
              type="email" 
              required 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={updateEmail.isPending || email === user?.email}
            className="btn-primary"
          >
            {updateEmail.isPending ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>

      <div className="bg-bg-card border border-border-main rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-text-main">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          {passwordMessage.text && (
            <div className={`p-3 rounded-md text-sm ${passwordMessage.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
              {passwordMessage.text}
            </div>
          )}
          <div>
            <label className="input-label">Current Password</label>
            <input 
              type="password" 
              required 
              className="input-field" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">New Password</label>
            <input 
              type="password" 
              required 
              minLength={8}
              className="input-field" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-text-muted mt-1">Must be at least 8 characters with numbers and letters.</p>
          </div>
          <div>
            <label className="input-label">Confirm New Password</label>
            <input 
              type="password" 
              required 
              className="input-field" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={updatePassword.isPending}
            className="btn-primary"
          >
            {updatePassword.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="bg-bg-card border border-border-main rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-text-main">Data Export</h2>
        </div>
        <div className="max-w-md">
          <p className="text-sm text-text-muted mb-4">
            Download a complete snapshot of your data including topics, questions, attempts, and connected integrations. 
            This process runs in the background and you will receive a notification when it's ready.
          </p>
          <button 
            onClick={() => requestExport.mutate()}
            disabled={requestExport.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {requestExport.isPending ? 'Starting Export...' : 'Export My Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
