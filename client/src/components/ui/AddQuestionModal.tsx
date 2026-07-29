import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { LinkIcon, Youtube, Building2, Globe, Star, Check } from 'lucide-react';

export const AddQuestionModal = ({ isOpen, onClose, onSubmit, initialData = null, mode = 'add' }) => {
    const [formData, setFormData] = useState({
        title: '',
        problemUrl: '',
        difficulty: 'Medium',
        platform: 'leetcode',
        resource: '',
        companyTags: '',
        isStarred: false,
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData && mode === 'edit') {
                setFormData({
                    title: initialData.title || '',
                    problemUrl: initialData.questionId?.problemUrl || '',
                    difficulty: initialData.questionId?.difficulty || 'Medium',
                    platform: initialData.questionId?.platform || 'leetcode',
                    resource: initialData.questionId?.resource || '',
                    companyTags: Array.isArray(initialData.questionId?.companyTags)
                        ? initialData.questionId.companyTags.join(', ')
                        : '',
                    isStarred: initialData.isStarred || false,
                    notes: initialData.notes || ''
                });
            } else {
                setFormData({
                    title: '',
                    problemUrl: '',
                    difficulty: 'Medium',
                    platform: 'leetcode',
                    resource: '',
                    companyTags: '',
                    isStarred: false,
                    notes: ''
                });
            }
        }
    }, [isOpen, initialData, mode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        const tagsArray = formData.companyTags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');

        onSubmit({
            ...formData,
            companyTags: tagsArray
        });

        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? "Edit Question" : "Add New Question"}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                        Question Title *
                    </label>
                    <input
                        autoFocus
                        type="text"
                        name="title"
                        placeholder="e.g. Two Sum"
                        className="input-field"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">
                            Platform
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select
                                name="platform"
                                className="input-field pl-10 appearance-none"
                                value={formData.platform}
                                onChange={handleChange}
                            >
                                <option value="leetcode">LeetCode</option>
                                <option value="geeksforgeeks">GFG</option>
                                <option value="codestudio">CodeStudio</option>
                                <option value="hackerrank">HackerRank</option>
                                <option value="codechef">CodeChef</option>
                                <option value="interviewbit">InterviewBit</option>
                                <option value="ninjas">Ninjas</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">
                            Difficulty
                        </label>
                        <select
                            name="difficulty"
                            className="input-field"
                            value={formData.difficulty}
                            onChange={handleChange}
                        >
                            <option value="Basic">Basic</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                        Problem URL
                    </label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="url"
                            name="problemUrl"
                            placeholder="https://leetcode.com/problems/..."
                            className="input-field pl-10"
                            value={formData.problemUrl}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                        Resource (Video/Tutorial)
                    </label>
                    <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="url"
                            name="resource"
                            placeholder="https://youtube.com/watch?v=..."
                            className="input-field pl-10"
                            value={formData.resource}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                        Company Tags (comma separated)
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                        <textarea
                            name="companyTags"
                            placeholder="Amazon, Google, Microsoft..."
                            className="input-field pl-10 min-h-[80px] resize-none"
                            value={formData.companyTags}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                        Private Notes
                    </label>
                    <textarea
                        name="notes"
                        placeholder="Add strategies, edge cases, or reminders..."
                        className="input-field min-h-[100px] resize-none"
                        value={formData.notes}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-brand-primary/30 transition-all cursor-pointer"
                    onClick={() => setFormData(p => ({ ...p, isStarred: !p.isStarred }))}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${formData.isStarred ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-text-muted'}`}>
                        <Star className={`w-5 h-5 ${formData.isStarred ? 'fill-current' : ''}`} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-text-main">Star this question</h4>
                        <p className="text-xs text-text-muted">Highlight this problem for quick review later.</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${formData.isStarred ? 'bg-yellow-400 border-yellow-400' : 'border-slate-700'}`}>
                        {formData.isStarred && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full mt-6">
                    {mode === 'edit' ? "Save Changes" : "Add Question"}
                </button>
            </form>
        </Modal>
    );
};
