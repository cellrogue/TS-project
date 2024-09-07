'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Comment, Thread } from '@/app/types/thread';
import { getThreadById, updateThread } from '@/lib/thread.db';
import { useParams } from 'next/navigation';
import { useAuth } from '../providers/authProvider';

type CommentsContextType = {
    comments: Comment[];
    setComments: (comments: Comment[]) => void;
    answered: boolean;
    setAnswered: (answered: boolean) => void;
    answeredComment: Comment | undefined;
    answeredCommentId: string | null;
    setAnsweredCommentId: (commentId: string | null) => void;
    handleCommentSubmit: (newComment: Comment) => Promise<void>;
    handleMarkAsAnswered: (commentId: string) => Promise<void>;
    id: string;
    threadCreatorId: string | null; 
};

type Params = {
    id: string;
};

export const CommentsContext = createContext<CommentsContextType | undefined>(
    undefined
);

const CommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: currentUser } = useAuth();
    const [thread, setThread] = useState<Thread | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [answered, setAnswered] = useState<boolean>(false);
    const [answeredCommentId, setAnsweredCommentId] = useState<string | null>(null);
    const { id } = useParams<Params>();
    const threadCreatorId = thread?.creator.id || null; 

    useEffect(() => {
        const fetchThreadData = async () => {
            const fetchedThread = await getThreadById(id);
            if (fetchedThread) {
                setThread(fetchedThread);
                setComments(fetchedThread.comments ?? []);
                setAnsweredCommentId(fetchedThread.answeredCommentId ?? null);
            }
        };

        fetchThreadData();
    }, [id]); 

    const answeredComment = comments.find((comment) => comment.id === answeredCommentId);

    const handleCommentSubmit = async (newComment: Comment): Promise<void> => {
        if (thread) {
            setComments([...comments, newComment]);
        }
    };

    const handleMarkAsAnswered = async (commentId: string): Promise<void> => {
        if (!thread) {
            console.error('Thread not found.');
            return;
        }

        if (thread.isQnA && currentUser?.id === thread.creator.id) {
            try {
                const newIsAnswered = answeredCommentId !== commentId;

                const fieldsToUpdate: Partial<Thread> = {
                    isAnswered: newIsAnswered,
                    answeredCommentId: newIsAnswered ? commentId : null,
                };

                await updateThread(thread.id, fieldsToUpdate);

                setAnswered(newIsAnswered);
                setAnsweredCommentId(newIsAnswered ? commentId : null);
            } catch (error) {
                console.error('Error toggling comment as answered:', error);
            }
        } else {
            console.error('Only the thread creator can mark a comment as an answer.');
        }
    };

    const value = {
        comments,
        setComments,
        answeredComment,
        answeredCommentId,
        setAnsweredCommentId,
        handleCommentSubmit,
        handleMarkAsAnswered,
        answered,
        setAnswered,
        id,
        threadCreatorId, 
    };

    return (
        <CommentsContext.Provider value={value}>
            {children}
        </CommentsContext.Provider>
    );
};

export default CommentsProvider;

export const useComments = () => {
    const context = useContext(CommentsContext);
    if (!context) {
        throw new Error('useComments must be used within a CommentsProvider');
    }
    return context;
};