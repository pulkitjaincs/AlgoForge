import React, { useState } from 'react';
import { useSheetAgentPlan, useSheetAgentApply } from '../../../hooks/useSheets';
import { SheetActionDiff, GeneratedTopic } from '@algoforge/shared';
import {
  Sparkles,
  X,
  Send,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sliders,
  Layers,
  Globe,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface SheetAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_CHIPS = [
  'Amazon SDE-1 Top 25',
  'Google Graph & DP Mastery',
  'Prune Solved Questions',
  'Striver SDE Sheet Essentials',
  'Blind 75 Focus',
];

export function SheetAgentDrawer({ isOpen, onClose }: SheetAgentDrawerProps) {
  const [prompt, setPrompt] = useState('');
  const [targetCount, setTargetCount] = useState<number>(20);
  const [topicFocus, setTopicFocus] = useState('All Topics');
  const [difficulty, setDifficulty] = useState('Any');
  const [diff, setDiff] = useState<SheetActionDiff | null>(null);

  // Apply state
  const [destination, setDestination] = useState<'workspace' | 'sheet' | 'replace'>('workspace');
  const [sheetTitle, setSheetTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Expanded topics in preview
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const planMutation = useSheetAgentPlan();
  const applyMutation = useSheetAgentApply();

  if (!isOpen) return null;

  const handlePlan = () => {
    if (!prompt.trim()) return;
    planMutation.mutate(
      {
        prompt: prompt.trim(),
        targetCount,
        topicFocus: topicFocus !== 'All Topics' ? topicFocus : undefined,
        difficulty: difficulty !== 'Any' ? difficulty : undefined,
      },
      {
        onSuccess: (data: SheetActionDiff) => {
          setDiff(data);
          // auto-expand all added topics
          const initialExpanded: Record<string, boolean> = {};
          data.addedTopics.forEach((t, idx) => {
            initialExpanded[`topic-${idx}`] = true;
          });
          setExpandedTopics(initialExpanded);
        },
      }
    );
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = () => {
    if (!diff) return;
    applyMutation.mutate(
      {
        diff,
        destination,
        sheetTitle: destination === 'sheet' ? sheetTitle || `Curated: ${prompt.slice(0, 40)}` : undefined,
        isPublic,
      },
      {
        onSuccess: () => {
          setDiff(null);
          setPrompt('');
          onClose();
        },
      }
    );
  };

  const totalQuestionsInDiff = diff
    ? diff.addedTopics.reduce(
        (acc, t) => acc + t.subtopics.reduce((sAcc, st) => sAcc + st.questions.length, 0),
        0
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-bg-dark border-l border-border-dark flex flex-col h-full shadow-2xl relative">
        {/* Header */}
        <div className="p-6 border-b border-border-dark flex items-center justify-between bg-bg-elevated/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-primary/20 border border-brand-primary/30 text-brand-primary shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-text-main">AI Sheet Copilot</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  Tool-Calling Agent
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Natural language curriculum engineering with dry-run diff confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-border-dark/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <span>Goal or Target Job Description</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Build a 20-problem sheet for Amazon SDE-1 focusing on DP and Trees', or paste a raw Job Description, or type 'Prune all solved questions'."
              rows={3}
              className="input-field text-sm leading-relaxed"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setPrompt(chip)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-bg-elevated border border-border-dark text-text-muted hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-bg-elevated/40 border border-border-dark">
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                Problems ({targetCount})
              </label>
              <select
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="input-field text-xs py-1.5"
              >
                <option value={10}>10 Problems</option>
                <option value={20}>20 Problems</option>
                <option value={35}>35 Problems</option>
                <option value={50}>50 Problems</option>
                <option value={75}>75 Problems (Full Curriculum)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                Topic Focus
              </label>
              <select
                value={topicFocus}
                onChange={(e) => setTopicFocus(e.target.value)}
                className="input-field text-xs py-1.5"
              >
                <option value="All Topics">All Core Topics</option>
                <option value="Dynamic Programming & Graphs">DP & Graphs</option>
                <option value="Trees & Binary Search">Trees & BST</option>
                <option value="Arrays & Two Pointers">Arrays & Sliding Window</option>
                <option value="Linked Lists & Stacks">Lists & Stacks</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-field text-xs py-1.5"
              >
                <option value="Any">Mixed / Realistic</option>
                <option value="Easy">Easy (Warmups)</option>
                <option value="Medium">Medium (FAANG Core)</option>
                <option value="Hard">Hard (Competitive)</option>
              </select>
            </div>
          </div>

          {/* Plan Trigger Button */}
          <button
            onClick={handlePlan}
            disabled={planMutation.isPending || !prompt.trim()}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-brand-primary/20"
          >
            {planMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Agent Planning Tool Calls...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Plan (Dry Run)</span>
              </>
            )}
          </button>

          {/* Action Diff Preview Section */}
          {diff && (
            <div className="space-y-5 pt-4 border-t border-border-dark animate-fade-in">
              <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/30">
                <div className="flex items-center gap-2 text-brand-primary font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Agent Action Plan Ready</span>
                </div>
                <p className="text-xs text-text-main leading-relaxed">{diff.summary}</p>
                <div className="flex items-center gap-3 mt-3 text-[11px] text-text-muted">
                  <span className="font-semibold text-success">+{totalQuestionsInDiff} questions added</span>
                  {diff.removedQuestionIds.length > 0 && (
                    <span className="font-semibold text-danger">-{diff.removedQuestionIds.length} pruned</span>
                  )}
                  <span>{diff.addedTopics.length} topics</span>
                </div>
              </div>

              {/* Destination Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-text-main uppercase tracking-wider block">
                  Choose Destination
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setDestination('workspace')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      destination === 'workspace'
                        ? 'bg-brand-primary/20 border-brand-primary text-text-main shadow-md'
                        : 'bg-bg-elevated border-border-dark text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1">Append Workspace</div>
                    <div className="text-[10px] text-text-muted leading-tight">
                      Add to active study list
                    </div>
                  </button>

                  <button
                    onClick={() => setDestination('sheet')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      destination === 'sheet'
                        ? 'bg-brand-primary/20 border-brand-primary text-text-main shadow-md'
                        : 'bg-bg-elevated border-border-dark text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1">New Public Sheet</div>
                    <div className="text-[10px] text-text-muted leading-tight">
                      Publish to Community Discover
                    </div>
                  </button>

                  <button
                    onClick={() => setDestination('replace')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      destination === 'replace'
                        ? 'bg-danger/20 border-danger text-text-main shadow-md'
                        : 'bg-bg-elevated border-border-dark text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="font-bold text-xs text-danger mb-1">Fresh Start</div>
                    <div className="text-[10px] text-text-muted leading-tight">
                      Replace current workspace
                    </div>
                  </button>
                </div>

                {destination === 'sheet' && (
                  <div className="space-y-2 pt-2 animate-fade-in">
                    <input
                      type="text"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      placeholder="Sheet Title (e.g. Amazon SDE-1 Curated 2026)"
                      className="input-field text-xs py-2"
                    />
                    <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="rounded border-border-dark"
                      />
                      <span>List publicly in Discover Sheets</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Topics Tree Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-main uppercase tracking-wider">
                    Curated Topics & Questions
                  </span>
                  <span className="text-xs text-text-muted">{totalQuestionsInDiff} total</span>
                </div>

                <div className="space-y-2">
                  {diff.addedTopics.map((topic, tIdx) => {
                    const topicKey = `topic-${tIdx}`;
                    const isExpanded = !!expandedTopics[topicKey];

                    return (
                      <div
                        key={tIdx}
                        className="rounded-xl border border-border-dark bg-bg-elevated/40 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleTopic(topicKey)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-border-dark/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 font-semibold text-sm text-text-main">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-brand-primary" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-text-muted" />
                            )}
                            <span>{topic.title}</span>
                          </div>
                          <span className="text-xs text-text-muted font-medium">
                            {topic.subtopics.reduce((acc, s) => acc + s.questions.length, 0)} problems
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-border-dark/40 pt-3">
                            {topic.subtopics.map((sub, sIdx) => (
                              <div key={sIdx} className="space-y-2">
                                <div className="text-xs font-bold text-text-muted uppercase tracking-wider pl-2 border-l-2 border-brand-primary/40">
                                  {sub.title}
                                </div>
                                <div className="space-y-1.5 pl-2">
                                  {sub.questions.map((q, qIdx) => (
                                    <div
                                      key={qIdx}
                                      className="flex items-center justify-between gap-3 p-2 rounded-lg bg-bg-dark border border-border-dark/60 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-medium text-text-main truncate">
                                          {q.title}
                                        </span>
                                        {q.companyTags && q.companyTags.length > 0 && (
                                          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-bg-elevated border border-border-dark text-text-muted">
                                            {q.companyTags[0]}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            q.difficulty === 'Easy'
                                              ? 'bg-success/15 text-success'
                                              : q.difficulty === 'Hard'
                                              ? 'bg-danger/15 text-danger'
                                              : 'bg-warning/15 text-warning'
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
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {diff && (
          <div className="p-4 border-t border-border-dark bg-bg-elevated/80 flex items-center justify-between gap-3">
            <button
              onClick={() => setDiff(null)}
              className="btn-secondary text-xs"
            >
              Reset Diff
            </button>
            <button
              onClick={handleApply}
              disabled={applyMutation.isPending}
              className="btn-primary text-xs flex items-center gap-2 font-bold px-5 py-2.5 shadow-lg shadow-brand-primary/25"
            >
              {applyMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Committing Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Apply Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
