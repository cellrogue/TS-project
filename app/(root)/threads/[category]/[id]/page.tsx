'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { deleteThread, getThreadById, lockThread } from '@/lib/thread.db';
import { FaUnlock, FaLock, FaTrash, FaEdit } from 'react-icons/fa';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Comments } from '@/components/Comments';
import { NewCommentForm } from '@/components/NewCommentForm';
import { Thread, Comment } from '@/app/types/thread';
import { User } from '@/app/types/user';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/Loading';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useComments } from '@/app/contexts/CommentsContext';
import toast from 'react-hot-toast';
import { getUserById } from '@/lib/user.db';
import { useAuth } from '@/app/providers/authProvider';

const ThreadDetailsPage = () => {
    const {
        handleCommentSubmit,
        setComments,
        setAnswered,
        setAnsweredCommentId,
        id,
    } = useComments();

    const [thread, setThread] = useState<Thread | null>(null);
    const [threadCreatorId, setThreadCreatorId] = useState<User | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth() as { user: User | null };
    console.log('Current user:', currentUser);

    useEffect(() => {
        const fetchThread = async () => {
            if (id) {
                try {
                    const fetchedThread = await getThreadById(id.toString() || '');
                    if (fetchedThread) {
                        setThread(fetchedThread);
                        setComments(fetchedThread.comments);
                        setThreadCreatorId(fetchedThread.creator);
                        setAnswered(fetchedThread.isAnswered ?? false);
                        setAnsweredCommentId(
                            fetchedThread.answeredCommentId ?? null
                        );
                    } else {
                        console.log('No thread found with the given ID.');
                        router.push('/404');
                    }
                } catch (error) {
                    console.error('Error fetching thread data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                console.log('ID is not available in search parameters.');
            }
        };

        fetchThread();
    }, [id, router]);

    const handleToggleLock = async () => {
        if (!thread || !currentUser) return;
    
        const isCreator = thread.creator.id === currentUser.id;
        const isModerator = currentUser?.isModerator;
        const isAuthorized = isCreator || isModerator;
    
        if (!isAuthorized) {
            toast.error('You are not authorized to lock/unlock this thread.');
            return;
        }
    
        try {
            await lockThread(thread.id, !thread.isLocked);
            setThread({ ...thread, isLocked: !thread.isLocked });
        } catch (error) {
            console.error('Failed to lock/unlock thread.', error);
        }
    };
    

    const handleDeleteThread = async () => {
        if (!thread || !currentUser) return;

        try {
            await deleteThread(thread.id, currentUser.id);
            router.push('/');
        } catch (error) {
            console.error('Failed to delete thread.', error);
        }
    };

    const handleEditThread = () => {
        if (thread?.id) {
            router.push(`/threads/edit/${thread.id}`);
        }
    };

    if (loading || !thread) return <Loading />;

    return (
        <main className='flex flex-col justify-between'>
            <div className='w-full mx-auto pl-12 px-6 max-w-6xl my-8 pt-6'>
                <div className='border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-muted-foreground text-sm font-semibold p-4 bg-secondary flex items-center justify-between h-auto w-full'>
                                    <div>
                                        <p>{thread.title}</p>
                                    </div>
                                    <div className='space-x-2'>
                                        {currentUser && (
                                            <>
                                                <button onClick={handleToggleLock}>
                                                    {thread.isLocked ? (
                                                        <Badge
                                                            variant='destructive'
                                                            className='rounded-full p-3'>
                                                            <FaLock className='h-3 w-3' />
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant='secondary'
                                                            className='rounded-full p-3 transition-all duration-300 hover:scale-105'>
                                                            <FaUnlock className='h-3 w-3' />
                                                        </Badge>
                                                    )}
                                                    </button>
                                                    {(currentUser?.id === thread.creator.id || currentUser?.isModerator) && (
                                                        <>
                                                            {console.log('Current user is creator:', currentUser?.id === thread.creator.id)}
                                                            {console.log('Current user is moderator:', currentUser?.isModerator)}
                                                            <button onClick={handleEditThread}>
                                                                <Badge
                                                                    variant='secondary'
                                                                    className='rounded-full p-3 m-2'>
                                                                    <FaEdit className='h-3 w-3' />
                                                                </Badge>
                                                            </button>
                                                            <button onClick={handleDeleteThread}>
                                                                <Badge
                                                                    variant='destructive'
                                                                    className='rounded-full p-3 m-2'>
                                                                    <FaTrash className='h-3 w-3' />
                                                                </Badge>
                                                            </button>
                                                        </>
                                                    )}
                                            </>
                                        )}
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className='dark:bg-muted/50'>
                                <TableCell className='dark:bg-muted/50'>
                                    <div className='py-3 pl-1 pr-6 text-sm'>
                                        {thread.description}
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                        <TableBody>
                            <TableRow className='bg-secondary'>
                                <TableCell>
                                    <div className='flex justify-between items-center'>
                                        <span className='flex gap-1 text-muted-foreground'>
                                            By
                                            <p className='font-bold text-indigo-700 dark:text-indigo-300'>
                                                {' '}
                                                {thread.creator.name}
                                            </p>
                                        </span>

                                        {thread.isQnA && (
                                            <Badge variant='qna'>Q&A</Badge>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow className='bg-secondary'>
                                <TableCell>
                                    <div className='flex gap-2 mt-2'>
                                        <span className='font-semibold'>Tags:</span>
                                        {thread.tags.length > 0 ? (
                                            thread.tags.map((tag) => (
                                                <Badge key={tag.id} variant='outline'>
                                                    {tag.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span>No tags available</span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {thread && (
                    <Comments
                        isQnA={thread.isQnA ?? false}
                        isLocked={thread.isLocked}
                        threadCreatorId={thread.creator.id}
                    />
                )}
            </div>

            {!thread.isLocked && currentUser && (
                <div className='w-full pl-12 px-6 py-8 bg-primary-foreground'>
                    <div className='mx-auto max-w-3xl'>
                        <NewCommentForm
                            id={thread.id}
                            onCommentSubmit={handleCommentSubmit}
                        />
                    </div>
                </div>
            )}

            {thread.isLocked && (
                <div className='w-full max-w-3xl mx-auto pl-12 px-6 py-8'>
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>This thread is locked.</AlertTitle>
                        <AlertDescription>
                            No further comments can be added.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </main>
    );
};

export default ThreadDetailsPage;
