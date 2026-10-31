import React, { useState } from 'react';
import { usePublicSheets, usePublishSheet, useCloneSheet, useDeleteSheet, useSheetDetails } from '../hooks/useSheets';
import { useUser } from '../hooks/useAuth';
import {
  BookOpen,
  Search,
  Copy,
  Download,
  Star,
  Share2,
  Trash2,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Modal } from '../components/shared/Modal';
import { toast } from 'sonner';
import { Link, useSearchParams } from 'react-router-dom';

export default function DiscoverSheetsPage() {
  const [searchParams] = useSearchParams();
  const { data: user } = useUser();
  const { data: sheets, isLoading } = usePublicSheets();
  const publishSheet = usePublishSheet();
  const cloneSheet = useCloneSheet();
  const deleteSheet = useDeleteSheet();

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishData, setPublishData] = useState({ title: '', description: '', isPublic: true });
  const [searchQuery, setSearchQuery] = useState('');

  // Sheet preview state
  const [previewSheetId, setPreviewSheetId] = useState<string | null>(searchParams.get('sheet') || null);
  const { data: previewSheet, isLoading: isPreviewLoading } = useSheetDetails(previewSheetId || undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    publishSheet.mutate(publishData, {
      onSuccess: () => {
        setIsPublishModalOpen(false);
        setPublishData({ title: '', description: '', isPublic: true });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || err.message || 'Cannot publish an empty sheet. Add topics to your workspace first.');
      }
    });
  };

  const handleShare = (sheetId: string) => {
    const url = `${window.location.origin}/app/discover?sheet=${sheetId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(sheetId);
    toast.success('Sheet share link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredSheets = sheets?.filter((sheet: any) => 
    sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sheet.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in p-4 md:p-8">
      <Helmet>
        <title>Discover Sheets — AlgoForge</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-text-main">Discover Sheets</h1>
          <p className="text-text-muted mt-2 leading-relaxed">
            Browse public DSA sheets created by the community. Preview curriculums, clone them to your workspace to start practicing, or publish your own custom sheet.
          </p>
        </div>
        <button
          onClick={() => setIsPublishModalOpen(true)}
          className="btn-primary flex-shrink-0 flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
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
        <div className="flex items-center justify-center py-20 text-text-muted animate-pulse">
          Loading sheets...
        </div>
      ) : filteredSheets?.length === 0 ? (
        <div className="glass text-center py-20 px-8 rounded-xl border border-border-dark">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
            <Search className="w-8 h-8 text-brand-primary" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">No sheets found</h3>
          <p className="text-text-muted max-w-sm mx-auto">
            Try adjusting your search query or be the first to publish a sheet!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSheets?.map((sheet: any) => {
            const isAuthor = user && (sheet.authorId === user.id || sheet.author?.username === user.username);
            const topicsCount = Array.isArray(sheet.topics) ? sheet.topics.length : 0;
            const questionsCount = Array.isArray(sheet.topics)
              ? sheet.topics.reduce((acc: number, t: any) => {
                  const subList = t.subTopics || t.subtopics || [];
                  const subCount = Array.isArray(subList)
                    ? subList.reduce((s: number, st: any) => s + (st.questions?.length || 0), 0)
                    : 0;
                  return acc + subCount + (t.questions?.length || 0);
                }, 0)
              : 0;

            return (
              <div
                key={sheet.id}
                className="card p-6 flex flex-col group/card hover:border-brand-primary/40 transition-all h-full bg-bg-dark border-border-dark shadow-md hover:shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center border border-brand-primary/20">
                    <BookOpen className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare(sheet.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-bg-elevated transition-colors"
                      title="Share link"
                    >
                      {copiedId === sheet.id ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isAuthor && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${sheet.title}"?`)) {
                            deleteSheet.mutate(sheet.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete your published sheet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex items-center gap-1 text-text-muted text-xs font-medium bg-bg-elevated px-2 py-1 rounded-full border border-border-dark">
                      <Download className="w-3 h-3" /> {sheet.cloneCount}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-text-main mb-1 group-hover/card:text-brand-primary transition-colors line-clamp-1">
                  {sheet.title}
                </h3>
                <p className="text-xs text-text-muted mb-4 flex-1 line-clamp-2">
                  {sheet.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-text-muted font-medium mb-4">
                  <span>{topicsCount} topics</span>
                  <span>•</span>
                  <span>{questionsCount} questions</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-dark mt-auto gap-2">
                  <Link
                    to={`/u/${sheet.author?.username}`}
                    className="flex items-center gap-2 hover:bg-bg-elevated p-1.5 -ml-1.5 rounded-lg transition-colors min-w-0"
                  >
                    {sheet.author?.avatarUrl ? (
                      <img
                        src={sheet.author.avatarUrl}
                        alt=""
                        loading="lazy"
                        className="w-6 h-6 rounded-full bg-border-dark object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-[10px] font-bold shrink-0">
                        {sheet.author?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-medium text-text-main truncate">
                      {sheet.author?.name}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setPreviewSheetId(sheet.id)}
                      className="btn-secondary py-1.5 px-2.5 text-xs flex items-center gap-1"
                      title="Preview questions"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => cloneSheet.mutate(sheet.id)}
                      disabled={cloneSheet.isPending}
                      className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" /> Clone
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Sheet Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Your Sheet"
      >
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl mb-4">
            <h4 className="font-semibold text-brand-primary mb-1 flex items-center gap-2">
              <Star className="w-4 h-4" /> Share your knowledge
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Publishing will capture a snapshot of all topics and questions in your active workspace. Community members will be able to preview and clone it.
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
              placeholder="What does this curriculum cover? Any tips for learners?"
              value={publishData.description}
              onChange={(e) => setPublishData({ ...publishData, description: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={publishSheet.isPending}
            className="btn-primary w-full mt-4"
          >
            {publishSheet.isPending ? 'Publishing Snapshot...' : 'Publish Sheet'}
          </button>
        </form>
      </Modal>

      {/* Preview Sheet Modal */}
      <Modal
        isOpen={!!previewSheetId}
        onClose={() => setPreviewSheetId(null)}
        title={previewSheet?.title || 'Sheet Preview'}
      >
        {isPreviewLoading ? (
          <div className="py-12 text-center text-text-muted animate-pulse">
            Loading sheet details...
          </div>
        ) : previewSheet ? (
          <div className="space-y-5 animate-fade-in">
            {previewSheet.description && (
              <p className="text-sm text-text-muted">{previewSheet.description}</p>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-dark border border-border-dark text-xs">
              <span className="text-text-muted">
                Author: <strong className="text-text-main">{previewSheet.author?.name}</strong> (@{previewSheet.author?.username})
              </span>
              <span className="text-text-muted">
                Cloned: <strong className="text-brand-primary">{previewSheet.cloneCount} times</strong>
              </span>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {Array.isArray(previewSheet.topics) && previewSheet.topics.length > 0 ? (
                previewSheet.topics.map((topic: any, tIdx: number) => {
                  const subTopics = topic.subTopics || topic.subtopics || [];
                  const questions = topic.questions || [];

                  return (
                    <div
                      key={tIdx}
                      className="p-3.5 rounded-xl bg-bg-elevated/40 border border-border-dark space-y-2.5"
                    >
                      <div className="font-bold text-sm text-text-main flex items-center justify-between">
                        <span>{topic.title}</span>
                      </div>

                      {/* Subtopics */}
                      {subTopics.map((sub: any, sIdx: number) => (
                        <div key={sIdx} className="space-y-1.5 pl-3 border-l-2 border-brand-primary/30">
                          <div className="text-xs font-semibold text-text-muted">{sub.title}</div>
                          <div className="space-y-1">
                            {(sub.questions || []).map((q: any, qIdx: number) => (
                              <div
                                key={qIdx}
                                className="flex items-center justify-between gap-2 p-1.5 rounded bg-bg-dark text-xs"
                              >
                                <span className="text-text-main truncate">{q.title}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      q.difficulty === 'Easy'
                                        ? 'text-success'
                                        : q.difficulty === 'Hard'
                                        ? 'text-danger'
                                        : 'text-warning'
                                    }`}
                                  >
                                    {q.difficulty}
                                  </span>
                                  {q.problemUrl && q.problemUrl !== '#' && (
                                    <a
                                      href={q.problemUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-text-muted hover:text-brand-primary"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Direct questions on topic */}
                      {questions.length > 0 && (
                        <div className="space-y-1 pl-3 border-l-2 border-border-dark">
                          {questions.map((q: any, qIdx: number) => (
                            <div
                              key={qIdx}
                              className="flex items-center justify-between gap-2 p-1.5 rounded bg-bg-dark text-xs"
                            >
                              <span className="text-text-main truncate">{q.title}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  q.difficulty === 'Easy'
                                    ? 'text-success'
                                    : q.difficulty === 'Hard'
                                    ? 'text-danger'
                                    : 'text-warning'
                                }`}
                              >
                                {q.difficulty}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-text-muted text-center py-4">
                  No topics in this sheet snapshot.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border-dark">
              <button
                type="button"
                onClick={() => setPreviewSheetId(null)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  cloneSheet.mutate(previewSheet.id, {
                    onSuccess: () => setPreviewSheetId(null)
                  });
                }}
                disabled={cloneSheet.isPending}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Clone Sheet to Workspace
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-text-muted text-xs">
            Sheet not found.
          </div>
        )}
      </Modal>
    </div>
  );
}
