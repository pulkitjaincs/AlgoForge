import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCircle2, Info, AlertCircle, AlertTriangle } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import { Link } from 'react-router-dom';

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead.mutate([id]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-danger" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-brand-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="btn-icon cursor-pointer relative" 
        title="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-text-muted hover:text-text-main transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-primary rounded-full ring-2 ring-bg-elevated animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-bg-dark border border-border-dark shadow-2xl rounded-xl overflow-hidden z-50 animate-fade-in">
          <div className="p-4 border-b border-border-dark flex items-center justify-between bg-bg-elevated">
            <h3 className="font-bold text-text-main">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="text-xs text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-text-muted text-sm animate-pulse">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-text-muted/30 mx-auto mb-3" />
                <p className="text-text-muted text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border-dark/50">
                {notifications.map((notif: any) => {
                  const content = (
                    <div className={`p-4 flex gap-3 hover:bg-bg-elevated transition-colors ${!notif.isRead ? 'bg-brand-primary/5' : ''}`}>
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-semibold truncate pr-2 ${!notif.isRead ? 'text-text-main' : 'text-text-muted'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-text-muted whitespace-nowrap shrink-0">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-xs ${!notif.isRead ? 'text-text-muted' : 'text-text-muted/70'} line-clamp-2`}>
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button 
                          onClick={(e) => handleMarkAsRead(e, notif.id)}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-border-dark text-text-muted hover:text-brand-primary transition-colors mt-2"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );

                  return notif.link ? (
                    <Link key={notif.id} to={notif.link} onClick={() => setIsOpen(false)} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={notif.id}>{content}</div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
