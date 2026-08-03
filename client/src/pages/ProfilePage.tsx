import { useUser } from '../hooks/useAuth';
import { User as UserIcon, Mail, Calendar } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data } = useUser();
  const user = data as UserData | undefined;

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-4xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">Software Engineer</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <UserIcon className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Mail className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Calendar className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
