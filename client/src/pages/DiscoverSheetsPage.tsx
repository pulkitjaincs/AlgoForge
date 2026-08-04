import { usePublicSheets, usePublishSheet } from '../hooks/useSheets';
import { BookOpen, Search, Copy, Download, Star, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Modal } from '../components/shared/Modal';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function DiscoverSheetsPage() {
  const { data: sheets, isLoading } = usePublicSheets();
  const publishSheet = usePublishSheet();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishData, setPublishData] = useState({ title: '', description: '', isPublic: true });
  const [searchQuery, setSearchQuery] = useState('');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    publishSheet.mutate(publishData, {
      onSuccess: () => {
        setIsPublishModalOpen(false);
        setPublishData({ title: '', description: '', isPublic: true });
        toast.success('Sheet published successfully!');
      },
      onError: () => {
        toast.error('Failed to publish sheet');
      }
    });
  };

  const filteredSheets = sheets?.filter((sheet: any) => 
    sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sheet.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <Helmet>
        <title>AlgoForge — Discover Sheets</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-text-main">Discover Sheets</h1>
          <p className="text-text-muted mt-2 leading-relaxed">
            Browse public DSA sheets created by the community. Clone them to your own workspace to start practicing, or publish your own custom curriculum.
          </p>
        </div>
        <button onClick={() => setIsPublishModalOpen(true)} className="btn-primary flex-shrink-0 flex items-center gap-2">
          <Share2 className="w-4 h-4" /> Publish Your Sheet
        </button>
      </div>

      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-text-muted" />
        </div>
        <input
          type="text"
          className="input-field pl-10 bg-bg-dark border-border-dark"
          placeholder="Search sheets by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-text-muted">Loading sheets...</div>
      ) : filteredSheets?.length === 0 ? (
        <div className="glass text-center py-20 px-8 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
            <Search className="w-8 h-8 text-brand-primary" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">No sheets found</h3>
          <p className="text-text-muted max-w-sm mx-auto">Try adjusting your search query or be the first to publish a sheet!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSheets?.map((sheet: any) => (
            <div key={sheet.id} className="card p-6 flex flex-col group/card hover:border-brand-primary/30 transition-all h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center border border-brand-primary/20">
                  <BookOpen className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="flex items-center gap-1 text-text-muted text-xs font-medium bg-bg-elevated px-2 py-1 rounded-full border border-border-dark">
                  <Download className="w-3 h-3" /> {sheet.cloneCount}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-text-main mb-2 group-hover/card:text-brand-primary transition-colors line-clamp-1">{sheet.title}</h3>
              <p className="text-sm text-text-muted mb-6 flex-1 line-clamp-3">{sheet.description || "No description provided."}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border-dark mt-auto">
                <Link to={`/u/${sheet.author?.username}`} className="flex items-center gap-2 hover:bg-bg-elevated p-1.5 -ml-1.5 rounded-lg transition-colors">
                  {sheet.author?.avatarUrl ? (
                    <img src={sheet.author.avatarUrl} alt="" className="w-6 h-6 rounded-full bg-border-dark object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-[10px] font-bold">
                      {sheet.author?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-text-main">{sheet.author?.name}</span>
                </Link>
                <button 
                   onClick={() => toast.success('Cloning is coming soon!')}
                   className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Clone
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} title="Publish Your Sheet">
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl mb-4">
            <h4 className="font-semibold text-brand-primary mb-1 flex items-center gap-2">
               <Star className="w-4 h-4" /> Share your knowledge
            </h4>
            <p className="text-xs text-text-muted">
              Publishing will create a snapshot of your current topics and questions. Other users can clone this snapshot to their own workspace.
            </p>
          </div>
          
          <div>
            <label className="input-label">Title</label>
            <input
              type="text"
              autoFocus
              className="input-field"
              placeholder="e.g. 100 Days of Code DSA"
              value={publishData.title}
              onChange={(e) => setPublishData({ ...publishData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="What does this sheet cover?"
              value={publishData.description}
              onChange={(e) => setPublishData({ ...publishData, description: e.target.value })}
            />
          </div>
          <button type="submit" disabled={publishSheet.isPending} className="btn-primary w-full mt-4">
            {publishSheet.isPending ? 'Publishing...' : 'Publish Sheet'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
