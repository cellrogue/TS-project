'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Thread, ThreadStatus } from '../app/types/thread';
import { getAllThreads, getThreadById } from '@/lib/thread.db';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCategoryforURL } from '@/lib/formatCategory';
import { FaLock } from 'react-icons/fa';
import Loading from './Loading';
import { useAuth } from '@/app/providers/authProvider';
import { User } from '@/app/types/user';

export const LatestThreads = () => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<ThreadStatus | 'All'>('All');
    const [searchTag, setSearchTag] = useState('');

    const { user: currentUser } = useAuth() as { user: User | null };

    const router = useRouter();

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const data: Thread[] = await getAllThreads();
                setThreads(data);
                setFilteredThreads(data);
            } catch (error) {
                console.error('Error fetching threads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, []);

    useEffect(() => {
        let filtered = threads;

        if (selectedStatus !== 'All') {
            filtered = filtered.filter(thread => thread.status === selectedStatus);
        }

        if (searchTag.trim()) {
            filtered = filtered.filter(thread =>
                Array.isArray(thread.tags) &&
                thread.tags.some(tag =>
                    tag?.name?.toLowerCase().includes(searchTag.toLowerCase())
                )
            );
        }

        setFilteredThreads(filtered);
    }, [selectedStatus, searchTag, threads]);

    if (loading) return <Loading />;

    const handleRowClick = async (threadId: string, category: string) => {
        if (!currentUser) {
            console.error('User is not logged in');
            return;
        }
        
        try {
            const thread = await getThreadById(threadId);
            if (thread) {
                const formattedCategory = formatCategoryforURL(category);
                router.push(`/threads/${formattedCategory}/${threadId}`);
            } else {
                console.error('Thread not found');
            }
        } catch (error) {
            console.error('Error fetching thread:', error);
        }
    };

    return (
        <div className='mx-auto w-full pl-12 px-6 my-8 max-w-6xl'>
            <div className='flex justify-between'>
                <div className='mb-4'>
                    <label htmlFor="statusFilter" className='mr-2 text-m text-muted-foreground'>Filter by Status:</label>
                    <select
                        id="statusFilter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as ThreadStatus | 'All')}
                        className='p-2 border rounded text-sm text-muted-foreground'
                    >
                        <option value="All">All</option>
                        <option value="New">New</option>
                        <option value="Hot">Hot</option>
                    </select>
                </div>

                <div className='mb-4'>
                    <label htmlFor="tagSearch" className='mr-2 text-m text-muted-foreground'>Search by Tag:</label>
                    <input
                        type="text"
                        id="tagSearch"
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        placeholder="Enter tag"
                        className='p-2 border rounded text-sm text-muted-foreground'
                    />
                </div>
            </div>

            <Table className='border dark:border-muted'>
                <TableHeader>
                    <TableRow>
                        <TableHead className='bg-secondary'>
                            Latest Threads
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredThreads.length ? (
                        filteredThreads.map((thread) => (
                            <TableRow
                                key={thread.id}
                                onClick={() =>
                                    handleRowClick(thread.id, thread.category)
                                }
                                className='cursor-pointer dark:bg-muted/50'>
                                <TableCell>
                                    <div className='flex justify-between items-center'>
                                        <span className='truncate'>
                                            {thread.title}
                                        </span>
                                        <div className='flex items-center gap-2'>
                                            {thread.isQnA && (
                                                <Badge variant='qna'>Q&A</Badge>
                                            )}
                                            {thread.isLocked && (
                                                <Badge variant='destructive'>
                                                    <FaLock className='h-3 w-3 my-[0.2rem] mx-1' />
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex gap-1 mt-1 items-center'>
                                        <span className='text-xs text-muted-foreground'>
                                            in
                                        </span>
                                        <span className='text-xs hover:underline cursor-pointer'>
                                            {thread.category}
                                        </span>
                                    </div>
                                    <div className='flex justify-start my-2 space-x-2'>
                                        {thread.tags && thread.tags.map((tag) => (
                                            <Badge key={tag.name} variant="tag">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={2}
                                className='h-24 text-center'>
                                No threads found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
