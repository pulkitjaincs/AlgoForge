import React, { useState } from 'react';
import { useSheetAgentApply } from '../../../hooks/useSheets';
import { SheetActionDiff, GeneratedTopic } from '@algoforge/shared';
import { Modal } from '../../shared/Modal';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsedTopics, setParsedTopics] = useState<GeneratedTopic[]>([]);
  const [destination, setDestination] = useState<'workspace' | 'sheet' | 'replace'>('workspace');
  const [sheetTitle, setSheetTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const applyMutation = useSheetAgentApply();

  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parseCSV = (content: string) => {
    const lines = content.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1) {
      toast.error('CSV file has no data rows');
      return;
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
    const topicIdx = headers.findIndex((h) => h.includes('topic') && !h.includes('sub'));
    const subtopicIdx = headers.findIndex((h) => h.includes('subtopic') || h.includes('sub_topic'));
    const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('problem') || h.includes('question'));
    const diffIdx = headers.findIndex((h) => h.includes('diff'));
    const urlIdx = headers.findIndex((h) => h.includes('url') || h.includes('link'));

    if (titleIdx === -1) {
      toast.error('Could not find a "Title" or "Problem" column in CSV');
      return;
    }

    const topicMap = new Map<string, Map<string, any[]>>();

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      const clean = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');

      const topicName = topicIdx !== -1 && row[topicIdx] ? clean(row[topicIdx]) : 'General Practice';
      const subtopicName = subtopicIdx !== -1 && row[subtopicIdx] ? clean(row[subtopicIdx]) : 'Core Problems';
      const title = clean(row[titleIdx]);
      if (!title) continue;

      let difficulty: any = 'Medium';
      if (diffIdx !== -1 && row[diffIdx]) {
        const d = clean(row[diffIdx]).toLowerCase();
        if (d.includes('easy')) difficulty = 'Easy';
        else if (d.includes('hard')) difficulty = 'Hard';
        else if (d.includes('basic')) difficulty = 'Basic';
      }

      const problemUrl = urlIdx !== -1 && row[urlIdx] ? clean(row[urlIdx]) : '';

      if (!topicMap.has(topicName)) {
        topicMap.set(topicName, new Map());
      }
      const subMap = topicMap.get(topicName)!;
      if (!subMap.has(subtopicName)) {
        subMap.set(subtopicName, []);
      }

      subMap.get(subtopicName)!.push({
        title,
        difficulty,
        problemUrl: problemUrl.startsWith('http') ? problemUrl : '#',
        platform: problemUrl.includes('codeforces') ? 'codeforces' : 'leetcode',
        companyTags: [],
      });
    }

    const result: (GeneratedTopic & { subTopics?: any[] })[] = [];
    topicMap.forEach((subMap, topicTitle) => {
      const subtopics: any[] = [];
      subMap.forEach((questions, subTitle) => {
        subtopics.push({ title: subTitle, questions });
      });
      result.push({
        title: topicTitle,
        description: `Imported from CSV (${subtopics.reduce((acc, s) => acc + s.questions.length, 0)} questions)`,
        subtopics,
        subTopics: subtopics,
      });
    });

    if (result.length === 0) {
      toast.error('No valid problems parsed from CSV');
      return;
    }

    setParsedTopics(result);
    toast.success(`Successfully parsed ${result.reduce((acc, t) => acc + t.subtopics.reduce((s, q) => s + q.questions.length, 0), 0)} questions!`);
  };

  const parsePastedContent = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const json = JSON.parse(trimmed);
        const rawList = Array.isArray(json) ? json : json.topics || [];
        const normalized = rawList.map((t: any) => {
          const subList = t.subtopics || t.subTopics || [];
          return {
            title: t.title || 'Untitled Topic',
            description: t.description || '',
            subtopics: subList,
            subTopics: subList,
          };
        });
        setParsedTopics(normalized);
        const count = normalized.reduce(
          (acc: number, t: any) => acc + (t.subtopics || []).reduce((s: number, sub: any) => s + (sub.questions?.length || 0), 0),
          0
        );
        toast.success(`Loaded JSON with ${normalized.length} topics (${count} problems)!`);
        return;
      } catch {
        toast.error('Invalid JSON syntax');
        return;
      }
    }

    parseCSV(trimmed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(text);
          const rawList = Array.isArray(json) ? json : json.topics || [];
          const normalized = rawList.map((t: any) => {
            const subList = t.subtopics || t.subTopics || [];
            return {
              title: t.title || 'Untitled Topic',
              description: t.description || '',
              subtopics: subList,
              subTopics: subList,
            };
          });
          setParsedTopics(normalized);
          toast.success(`Loaded JSON with ${normalized.length} topics`);
        } catch {
          toast.error('Invalid JSON file');
        }
      } else {
        const trimmed = text.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          parsePastedContent(trimmed);
        } else {
          parseCSV(text);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCommit = () => {
    if (parsedTopics.length === 0) return;

    const diff: SheetActionDiff = {
      summary: `Imported ${parsedTopics.length} topics via CSV/JSON`,
      addedTopics: parsedTopics,
      removedQuestionIds: [],
      reorderedTopicIds: [],
    };

    applyMutation.mutate(
      {
        diff,
        destination,
        sheetTitle: destination === 'sheet' ? sheetTitle || 'Imported Community Sheet' : undefined,
        isPublic,
      },
      {
        onSuccess: () => {
          setParsedTopics([]);
          setRawText('');
          onClose();
        },
      }
    );
  };

  const totalQuestions = parsedTopics.reduce(
    (acc, t) =>
      acc +
      ((t.subtopics || (t as any).subTopics || []) as any[]).reduce(
        (s: number, sub: any) => s + (sub.questions?.length || 0),
        0
      ),
    0
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Sheet (CSV or JSON)">
      <div className="space-y-5">
        {parsedTopics.length === 0 ? (
          <>
            <div className="border-2 border-dashed border-border-dark hover:border-brand-primary/50 transition-colors rounded-2xl p-6 text-center bg-bg-elevated/40">
              <UploadCloud className="w-10 h-10 text-brand-primary mx-auto mb-2" />
              <div className="text-sm font-bold text-text-main">
                Drop your CSV or JSON file here
              </div>
              <p className="text-xs text-text-muted mt-1">
                Supports standard headers: <code className="text-brand-primary">Topic, Subtopic, Title, Difficulty, URL</code>
              </p>
              <label className="mt-4 inline-block btn-secondary text-xs cursor-pointer">
                Browse File
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Or Paste CSV or JSON Text Directly
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Topic,Subtopic,Title,Difficulty,URL&#10;Arrays,Two Pointers,Two Sum,Easy,https://leetcode.com/problems/two-sum/&#10;DP,1D,Climbing Stairs,Easy,https://leetcode.com/problems/climbing-stairs/"
                rows={5}
                className="input-field text-xs font-mono"
              />
              <button
                onClick={() => parsePastedContent(rawText)}
                disabled={!rawText.trim()}
                className="w-full btn-secondary text-xs py-2"
              >
                Parse Pasted CSV / JSON
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-success font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{parsedTopics.length} Topics & {totalQuestions} Problems Ready</span>
              </div>
              <button
                onClick={() => setParsedTopics([])}
                className="text-xs text-text-muted hover:text-text-main underline"
              >
                Change File
              </button>
            </div>

            {/* Destination options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-main uppercase tracking-wider block">
                Destination
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDestination('workspace')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    destination === 'workspace'
                      ? 'bg-brand-primary/20 border-brand-primary text-text-main shadow-md'
                      : 'bg-bg-elevated border-border-dark text-text-muted hover:text-text-main'
                  }`}
                >
                  <div className="font-bold text-xs mb-1">Append Workspace</div>
                  <div className="text-[10px] text-text-muted">Add to current sheet</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDestination('sheet')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    destination === 'sheet'
                      ? 'bg-brand-primary/20 border-brand-primary text-text-main shadow-md'
                      : 'bg-bg-elevated border-border-dark text-text-muted hover:text-text-main'
                  }`}
                >
                  <div className="font-bold text-xs mb-1">New Public Sheet</div>
                  <div className="text-[10px] text-text-muted">Publish to Discover</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDestination('replace')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    destination === 'replace'
                      ? 'bg-danger/20 border-danger text-text-main shadow-md'
                      : 'bg-bg-elevated border-border-dark text-text-muted hover:text-text-main'
                  }`}
                >
                  <div className="font-bold text-xs text-danger mb-1">Fresh Start</div>
                  <div className="text-[10px] text-text-muted">Replace workspace</div>
                </button>
              </div>

              {destination === 'sheet' && (
                <div className="space-y-2 pt-2 animate-fade-in">
                  <input
                    type="text"
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    placeholder="Sheet Title (e.g. Blind 75 Full CSV)"
                    className="input-field text-xs py-2"
                  />
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-border-dark"
                    />
                    <span>Make publicly cloneable in Discover Sheets</span>
                  </label>
                </div>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-bg-dark border border-border-dark">
              {parsedTopics.map((topic, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1 px-2 rounded bg-bg-elevated/40">
                  <span className="font-medium text-text-main">{topic.title}</span>
                  <span className="text-text-muted">
                    {topic.subtopics.reduce((acc, s) => acc + s.questions.length, 0)} questions
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommit}
                disabled={applyMutation.isPending}
                className="btn-primary text-xs flex items-center gap-2"
              >
                {applyMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
