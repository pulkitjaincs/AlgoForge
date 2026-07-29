import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useQuestionStore = create(
    persist(
        (set, get) => ({
            topics: [],
            loading: false,
            navigationTarget: null,

            setTopics: (topics) => set({ topics }),
            setNavigationTarget: (id) => set({ navigationTarget: id }),


            addTopic: async (title, description = '') => {
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
            deleteTopic: async (topicId) => {
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
            editTopic: async (topicId, newTitle, newDescription) => {
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

            addSubTopic: async (topicId, title) => {
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

            deleteSubTopic: async (topicId, subTopicId) => {
                try {
                    const response = await fetch(`/api/topics/${topicId}/subtopics/${subTopicId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (result.success) {
                        set((state) => ({
                            topics: state.topics.map(t => t.id === topicId ? {
                                ...t,
                                subTopics: t.subTopics.filter(st => st.id !== subTopicId)
                            } : t)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to delete sub-topic:', error);
                }
            },
            editSubTopic: async (topicId, subTopicId, newTitle) => {
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
                                subTopics: t.subTopics.map(st => st.id === subTopicId ? { ...st, title: newTitle } : st)
                            } : t)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to edit sub-topic:', error);
                }
            },

            addQuestion: async (topicId, subTopicId, questionData) => {
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
                                    subTopics: topic.subTopics.map(st =>
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

            deleteQuestion: async (topicId, subTopicId, questionId) => {
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
                                    return { ...topic, questions: topic.questions.filter(q => q._id !== questionId) };
                                }

                                return {
                                    ...topic,
                                    subTopics: topic.subTopics.map(st =>
                                        st.id === subTopicId
                                            ? { ...st, questions: st.questions.filter(q => q._id !== questionId) }
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

            editQuestion: async (topicId, subTopicId, questionId, updatedData) => {
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
                                        questions: topic.questions.map(q =>
                                            q._id === questionId ? { ...q, ...result.data } : q
                                        )
                                    };
                                }

                                return {
                                    ...topic,
                                    subTopics: topic.subTopics.map(st =>
                                        st.id === subTopicId
                                            ? { ...st, questions: st.questions.map(q => q._id === questionId ? { ...q, ...result.data } : q) }
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

            toggleSolved: async (topicId, subTopicId, questionId) => {
                const previousTopics = get().topics;

                // Optimistic update
                set((state) => ({
                    topics: state.topics.map(topic => {
                        if (topic.id !== topicId) return topic;
                        const updateQ = q => q._id === questionId ? { ...q, isSolved: !q.isSolved } : q;

                        if (!subTopicId) {
                            return { ...topic, questions: topic.questions.map(updateQ) };
                        }

                        return {
                            ...topic,
                            subTopics: topic.subTopics.map(st =>
                                st.id === subTopicId
                                    ? { ...st, questions: st.questions.map(updateQ) }
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

            toggleStarred: async (topicId, subTopicId, questionId) => {
                const previousTopics = get().topics;

                // Optimistic update
                set((state) => ({
                    topics: state.topics.map(topic => {
                        if (topic.id !== topicId) return topic;
                        const updateQ = q => q._id === questionId ? { ...q, isStarred: !q.isStarred } : q;

                        if (!subTopicId) {
                            return { ...topic, questions: topic.questions.map(updateQ) };
                        }

                        return {
                            ...topic,
                            subTopics: topic.subTopics.map(st =>
                                st.id === subTopicId
                                    ? { ...st, questions: st.questions.map(updateQ) }
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

            updateNotes: async (topicId, subTopicId, questionId, notes) => {
                const previousTopics = get().topics;

                // Optimistic update
                set((state) => ({
                    topics: state.topics.map(topic => {
                        if (topic.id !== topicId) return topic;
                        const updateQ = q => q._id === questionId ? { ...q, notes } : q;

                        if (!subTopicId) {
                            return { ...topic, questions: topic.questions.map(updateQ) };
                        }

                        return {
                            ...topic,
                            subTopics: topic.subTopics.map(st =>
                                st.id === subTopicId
                                    ? { ...st, questions: st.questions.map(updateQ) }
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

            reorderTopics: (startIndex, endIndex) => set((state) => {
                const newTopics = [...state.topics];
                const [removed] = newTopics.splice(startIndex, 1);
                newTopics.splice(endIndex, 0, removed);
                return { topics: newTopics };
            }),

            reorderSubTopics: (topicId, startIndex, endIndex) => set((state) => ({
                topics: state.topics.map(topic => {
                    if (topic.id !== topicId) return topic;
                    const newSubTopics = [...topic.subTopics];
                    const [removed] = newSubTopics.splice(startIndex, 1);
                    newSubTopics.splice(endIndex, 0, removed);
                    return { ...topic, subTopics: newSubTopics };
                })
            })),

            reorderQuestions: (topicId, subTopicId, startIndex, endIndex) => set((state) => ({
                topics: state.topics.map(topic => {
                    if (topic.id !== topicId) return topic;

                    if (!subTopicId) {
                        const newQuestions = [...topic.questions];
                        const [removed] = newQuestions.splice(startIndex, 1);
                        newQuestions.splice(endIndex, 0, removed);
                        return { ...topic, questions: newQuestions };
                    }

                    return {
                        ...topic,
                        subTopics: topic.subTopics.map(st => {
                            if (st.id !== subTopicId) return st;
                            const newQuestions = [...st.questions];
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