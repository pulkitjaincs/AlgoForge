import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Topic, SubTopic, Question } from '../types';

export interface QuestionState {
    topics: Topic[];
    loading: boolean;
    navigationTarget: string | null;

    setTopics: (topics: Topic[]) => void;
    setNavigationTarget: (id: string | null) => void;
    addTopic: (title: string, description?: string) => Promise<void>;
    deleteTopic: (topicId: string) => Promise<void>;
    editTopic: (topicId: string, newTitle: string, newDescription?: string) => Promise<void>;
    addSubTopic: (topicId: string, title: string) => Promise<void>;
    deleteSubTopic: (topicId: string, subTopicId: string) => Promise<void>;
    editSubTopic: (topicId: string, subTopicId: string, newTitle: string) => Promise<void>;
    addQuestion: (topicId: string, subTopicId: string | null, questionData: Partial<Question>) => Promise<void>;
    deleteQuestion: (topicId: string, subTopicId: string | null, questionId: string) => Promise<void>;
    editQuestion: (topicId: string, subTopicId: string | null, questionId: string, updatedData: Partial<Question>) => Promise<void>;
    toggleSolved: (topicId: string, subTopicId: string | null, questionId: string) => Promise<void>;
    toggleStarred: (topicId: string, subTopicId: string | null, questionId: string) => Promise<void>;
    updateNotes: (topicId: string, subTopicId: string | null, questionId: string, notes: string) => Promise<void>;
    reorderTopics: (startIndex: number, endIndex: number) => void;
    reorderSubTopics: (topicId: string, startIndex: number, endIndex: number) => void;
    reorderQuestions: (topicId: string, subTopicId: string | null, startIndex: number, endIndex: number) => void;
    resetProgress: () => Promise<boolean>;
    fullReset: () => Promise<boolean>;
}

export const useQuestionStore = create<QuestionState>()(
    persist(
        (set, get) => ({
            topics: [],
            loading: false,
            navigationTarget: null,

            setTopics: (topics: Topic[]) => set({ topics }),
            setNavigationTarget: (id: string | null) => set({ navigationTarget: id }),

            addTopic: async (title: string, description = '') => {
                try {
                    const response = await fetch('/api/topics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, description })
                    });
                    const result = await response.json();
                    if (result.success) {
                        set((state) => ({
                            topics: [...state.topics, result.data]
                        }));
                    }
                } catch (error) {
                    console.error('Failed to add topic:', error);
                }
            },
            deleteTopic: async (topicId: string) => {
                try {
                    const response = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (result.success) {
                        set((state) => ({
                            topics: state.topics.filter(t => t.id !== topicId)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to delete topic:', error);
                }
            },
            editTopic: async (topicId: string, newTitle: string, newDescription?: string) => {
                try {
                    const response = await fetch(`/api/topics/${topicId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newTitle, description: newDescription })
                    });
                    const result = await response.json();
                    if (result.success) {
                        set((state) => ({
                            topics: state.topics.map(t => t.id === topicId ? { ...t, title: newTitle, description: newDescription } : t)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to edit topic:', error);
                }
            },

            addSubTopic: async (topicId: string, title: string) => {
                try {
                    const response = await fetch(`/api/topics/${topicId}/subtopics`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title })
                    });
                    const result = await response.json();
                    if (result.success) {
                        set((state) => ({
                            topics: state.topics.map(t => t.id === topicId ? {
                                ...t,
                                subTopics: [...(t.subTopics || []), result.data]
                            } : t)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to add sub-topic:', error);
                }
            },

            deleteSubTopic: async (topicId: string, subTopicId: string) => {
                try {
                    const response = await fetch(`/api/topics/${topicId}/subtopics/${subTopicId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (result.success) {
                        set((state) => ({
                            topics: state.topics.map(t => t.id === topicId ? {
                                ...t,
                                subTopics: (t.subTopics || []).filter(st => st.id !== subTopicId)
                            } : t)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to delete sub-topic:', error);
                }
            },
            editSubTopic: async (topicId: string, subTopicId: string, newTitle: string) => {
                try {
                    const response = await fetch(`/api/subtopics/${subTopicId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newTitle })
                    });
                    const result = await response.json();
                    if (result.success) {
                        set((state) => ({
                            topics: state.topics.map(t => t.id === topicId ? {
                                ...t,
                                subTopics: (t.subTopics || []).map(st => st.id === subTopicId ? { ...st, title: newTitle } : st)
                            } : t)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to edit sub-topic:', error);
                }
            },

            addQuestion: async (topicId: string, subTopicId: string | null, questionData: Partial<Question>) => {
                try {
                    const url = subTopicId
                        ? `/api/topics/${topicId}/subtopics/${subTopicId}/questions`
                        : `/api/topics/${topicId}/questions`;

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(questionData)
                    });
                    const result = await response.json();

                    if (result.success) {
                        set((state) => {
                            const newTopics = state.topics.map(topic => {
                                if (topic.id !== topicId) return topic;

                                if (!subTopicId) {
                                    return { ...topic, questions: [...(topic.questions || []), result.data] };
                                }

                                return {
                                    ...topic,
                                    subTopics: (topic.subTopics || []).map(st =>
                                        st.id === subTopicId
                                            ? { ...st, questions: [...(st.questions || []), result.data] }
                                            : st
                                    )
                                };
                            });
                            return { topics: newTopics };
                        });
                    }
                } catch (error) {
                    console.error('Failed to add question:', error);
                }
            },

            deleteQuestion: async (topicId: string, subTopicId: string | null, questionId: string) => {
                try {
                    const url = subTopicId
                        ? `/api/topics/${topicId}/subtopics/${subTopicId}/questions/${questionId}`
                        : `/api/topics/${topicId}/questions/${questionId}`;

                    const response = await fetch(url, { method: 'DELETE' });
                    const result = await response.json();

                    if (result.success) {
                        set((state) => {
                            const newTopics = state.topics.map(topic => {
                                if (topic.id !== topicId) return topic;

                                if (!subTopicId) {
                                    return { ...topic, questions: (topic.questions || []).filter(q => (q._id || q.id) !== questionId) };
                                }

                                return {
                                    ...topic,
                                    subTopics: (topic.subTopics || []).map(st =>
                                        st.id === subTopicId
                                            ? { ...st, questions: (st.questions || []).filter(q => (q._id || q.id) !== questionId) }
                                            : st
                                    )
                                };
                            });
                            return { topics: newTopics };
                        });
                    }
                } catch (error) {
                    console.error('Failed to delete question:', error);
                }
            },

            editQuestion: async (topicId: string, subTopicId: string | null, questionId: string, updatedData: Partial<Question>) => {
                try {
                    const response = await fetch(`/api/questions/${questionId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedData)
                    });
                    const result = await response.json();

                    if (result.success) {
                        set((state) => {
                            const newTopics = state.topics.map(topic => {
                                if (topic.id !== topicId) return topic;

                                if (!subTopicId) {
                                    return {
                                        ...topic,
                                        questions: (topic.questions || []).map(q =>
                                            (q._id || q.id) === questionId ? { ...q, ...result.data } : q
                                        )
                                    };
                                }

                                return {
                                    ...topic,
                                    subTopics: (topic.subTopics || []).map(st =>
                                        st.id === subTopicId
                                            ? { ...st, questions: (st.questions || []).map(q => (q._id || q.id) === questionId ? { ...q, ...result.data } : q) }
                                            : st
                                    )
                                };
                            });
                            return { topics: newTopics };
                        });
                    }
                } catch (error) {
                    console.error('Failed to edit question:', error);
                }
            },

            toggleSolved: async (topicId: string, subTopicId: string | null, questionId: string) => {
                const previousTopics = get().topics;

                // Optimistic update
                set((state) => ({
                    topics: state.topics.map(topic => {
                        if (topic.id !== topicId) return topic;
                        const updateQ = (q: Question) => (q._id || q.id) === questionId ? { ...q, isSolved: !q.isSolved } : q;

                        if (!subTopicId) {
                            return { ...topic, questions: (topic.questions || []).map(updateQ) };
                        }

                        return {
                            ...topic,
                            subTopics: (topic.subTopics || []).map(st =>
                                st.id === subTopicId
                                    ? { ...st, questions: (st.questions || []).map(updateQ) }
                                    : st
                            )
                        };
                    })
                }));

                try {
                    const response = await fetch(`/api/questions/${questionId}/toggle`, {
                        method: 'PATCH'
                    });
                    const result = await response.json();

                    if (!result.success) throw new Error('Failed to toggle solved');
                } catch (error) {
                    console.error('Failed to toggle solved, rolling back:', error);
                    set({ topics: previousTopics });
                }
            },

            toggleStarred: async (topicId: string, subTopicId: string | null, questionId: string) => {
                const previousTopics = get().topics;

                // Optimistic update
                set((state) => ({
                    topics: state.topics.map(topic => {
                        if (topic.id !== topicId) return topic;
                        const updateQ = (q: Question) => (q._id || q.id) === questionId ? { ...q, isStarred: !q.isStarred } : q;

                        if (!subTopicId) {
                            return { ...topic, questions: (topic.questions || []).map(updateQ) };
                        }

                        return {
                            ...topic,
                            subTopics: (topic.subTopics || []).map(st =>
                                st.id === subTopicId
                                    ? { ...st, questions: (st.questions || []).map(updateQ) }
                                    : st
                            )
                        };
                    })
                }));

                try {
                    const response = await fetch(`/api/questions/${questionId}/star`, {
                        method: 'PATCH'
                    });
                    const result = await response.json();

                    if (!result.success) throw new Error('Failed to toggle star');
                } catch (error) {
                    console.error('Failed to toggle star, rolling back:', error);
                    set({ topics: previousTopics });
                }
            },

            updateNotes: async (topicId: string, subTopicId: string | null, questionId: string, notes: string) => {
                const previousTopics = get().topics;

                // Optimistic update
                set((state) => ({
                    topics: state.topics.map(topic => {
                        if (topic.id !== topicId) return topic;
                        const updateQ = (q: Question) => (q._id || q.id) === questionId ? { ...q, notes } : q;

                        if (!subTopicId) {
                            return { ...topic, questions: (topic.questions || []).map(updateQ) };
                        }

                        return {
                            ...topic,
                            subTopics: (topic.subTopics || []).map(st =>
                                st.id === subTopicId
                                    ? { ...st, questions: (st.questions || []).map(updateQ) }
                                    : st
                            )
                        };
                    })
                }));

                try {
                    const response = await fetch(`/api/questions/${questionId}/notes`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ notes })
                    });
                    const result = await response.json();

                    if (!result.success) throw new Error('Failed to update notes');
                } catch (error) {
                    console.error('Failed to update notes, rolling back:', error);
                    set({ topics: previousTopics });
                }
            },

            reorderTopics: (startIndex: number, endIndex: number) => set((state) => {
                const newTopics = [...state.topics];
                const [removed] = newTopics.splice(startIndex, 1);
                newTopics.splice(endIndex, 0, removed);
                return { topics: newTopics };
            }),

            reorderSubTopics: (topicId: string, startIndex: number, endIndex: number) => set((state) => ({
                topics: state.topics.map(topic => {
                    if (topic.id !== topicId) return topic;
                    const newSubTopics = [...(topic.subTopics || [])];
                    const [removed] = newSubTopics.splice(startIndex, 1);
                    newSubTopics.splice(endIndex, 0, removed);
                    return { ...topic, subTopics: newSubTopics };
                })
            })),

            reorderQuestions: (topicId: string, subTopicId: string | null, startIndex: number, endIndex: number) => set((state) => ({
                topics: state.topics.map(topic => {
                    if (topic.id !== topicId) return topic;

                    if (!subTopicId) {
                        const newQuestions = [...(topic.questions || [])];
                        const [removed] = newQuestions.splice(startIndex, 1);
                        newQuestions.splice(endIndex, 0, removed);
                        return { ...topic, questions: newQuestions };
                    }

                    return {
                        ...topic,
                        subTopics: (topic.subTopics || []).map(st => {
                            if (st.id !== subTopicId) return st;
                            const newQuestions = [...(st.questions || [])];
                            const [removed] = newQuestions.splice(startIndex, 1);
                            newQuestions.splice(endIndex, 0, removed);
                            return { ...st, questions: newQuestions };
                        })
                    };
                })
            })),

            resetProgress: async () => {
                try {
                    const response = await fetch('/api/system/reset-progress', { method: 'PATCH' });
                    const result = await response.json();
                    if (result.success) {
                        set((state) => ({
                            topics: state.topics.map(t => ({
                                ...t,
                                questions: (t.questions || []).map(q => ({ ...q, isSolved: false })),
                                subTopics: (t.subTopics || []).map(st => ({
                                    ...st,
                                    questions: (st.questions || []).map(q => ({ ...q, isSolved: false }))
                                }))
                            }))
                        }));
                        return true;
                    }
                } catch (error) {
                    console.error('Failed to reset progress:', error);
                }
                return false;
            },

            fullReset: async () => {
                try {
                    const response = await fetch('/api/system/full-reset', { method: 'POST' });
                    const result = await response.json();
                    if (result.success) {
                        const fetchResponse = await fetch('/api/topics');
                        const fetchResult = await fetchResponse.json();
                        if (fetchResult.success) {
                            set({ topics: fetchResult.data });
                        }
                        return true;
                    }
                } catch (error) {
                    console.error('Failed to perform full reset:', error);
                }
                return false;
            },
        }),
        { name: 'algoforge-questions-storage' }
    )
);