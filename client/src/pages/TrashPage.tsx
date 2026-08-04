import { useTrash, useRestoreTrash, useDeleteTrash } from '../hooks/useTrash';
import { Trash2, RefreshCcw, FileText, Layers, Target } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

export default function TrashPage() {
  const { data: trashItems, isLoading } = useTrash();
  const restoreTrash = useRestoreTrash();
  const deleteTrash = useDeleteTrash();

  const handleRestore = (id: string) => {
    restoreTrash.mutate(id, {
      onSuccess: () => toast.success('Item restored successfully')
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      deleteTrash.mutate(id, {
        onSuccess: () => toast.success('Item permanently deleted')
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Topic': return <Layers className="w-5 h-5 text-brand-primary" />;
      case 'SubTopic': return <FileText className="w-5 h-5 text-brand-secondary" />;
      case 'Question': return <Target className="w-5 h-5 text-brand-accent" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <Helmet>
        <title>AlgoForge — Trash</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold text-text-main">Trash</h1>
        <p className="text-text-muted mt-1">Items deleted within the last 30 days can be restored.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-text-muted">Loading trash...</div>
      ) : trashItems?.length === 0 ? (
        <div className="glass text-center py-20 px-8 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-border-dark flex items-center justify-center mx-auto mb-4 border border-border-dark">
            <Trash2 className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">Trash is empty</h3>
          <p className="text-text-muted">Deleted topics, sub-topics, and questions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trashItems?.map((item: any) => (
            <div key={item.id} className="card p-4 flex items-center justify-between hover:border-border-dark transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-bg-elevated border border-border-dark">
                  {getIcon(item.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-text-main">{item.title}</h4>
                  <p className="text-xs text-text-muted mt-1">
                    {item.type} • Deleted on {new Date(item.deletedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRestore(item.id)}
                  disabled={restoreTrash.isPending}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" /> Restore
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteTrash.isPending}
                  className="btn-secondary-danger p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
