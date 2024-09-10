'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import TagsInput from './TagsInput';
import { ComboBox } from './SelectCategoryNewThread';
import { getThreadById, updateThread } from '@/lib/thread.db';
import { Thread, ThreadCategory } from '@/app/types/thread';
import { useAuth } from '@/app/providers/authProvider';

const FormSchema = z.object({
    threadTitle: z.string().min(10, {
        message: 'The thread title must be at least 10 characters.',
    }),
    threadBody: z.string().min(10, {
        message: 'The thread body must be at least 10 characters.',
    }),
    threadCategory: z.string().min(1, {
        message: 'Thread category is required.',
    }),
    isQnA: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
});

export const EditThreadPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [thread, setThread] = useState<Thread | null>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            threadTitle: '',
            threadBody: '',
            threadCategory: '',
            isQnA: false,
            tags: [],
        },
    });

    useEffect(() => {
        const fetchThread = async () => {
            try {
                const fetchedThread = await getThreadById(id.toString());
                if (!fetchedThread) {
                    toast.error('Thread not found');
                    router.push('/');
                } else {
                    setThread(fetchedThread);
                    form.reset({
                        threadTitle: fetchedThread.title,
                        threadBody: fetchedThread.description,
                        threadCategory: fetchedThread.category,
                        isQnA: fetchedThread.isQnA || false,
                        tags: fetchedThread.tags.map(tag => tag.name),
                    });
                }
            } catch (error) {
                console.error('Error fetching thread:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchThread();
    }, [id, router, form]);

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        if (!currentUser || !thread) {
            toast.error('You are not authorized to edit this thread.');
            return;
        }

        const isAuthorized =
            thread.creator.id === currentUser.id || currentUser.isModerator;

        if (!isAuthorized) {
            toast.error('You are not authorized to edit this thread.');
            return;
        }

        try {
            const updatedThread = {
                ...thread,
                title: data.threadTitle,
                description: data.threadBody,
                category: data.threadCategory as ThreadCategory,
                isQnA: data.isQnA || false,
                tags: (data.tags || []).map((tag) => ({ id: '', name: tag })),
            };

            await updateThread(thread.id, updatedThread);

            toast.success('Thread updated successfully');
            router.push('/');
        } catch (error) {
            toast.error('Failed to update thread.');
            console.error('Error updating thread:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='mx-auto w-2/3 space-y-4 pl-12 py-12 max-w-3xl'>
                <FormField
                    control={form.control}
                    name='threadTitle'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-xl'>
                                Edit Thread
                            </FormLabel>
                            <FormDescription className='pb-6'>
                                Please provide a title, body and its
                                corresponding category for your updated thread.
                            </FormDescription>
                            <FormControl>
                                <Input placeholder='Title' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='threadBody'
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea placeholder='Body' rows={5} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='tags'
                    render={({ field }) => (
                        <FormItem>
                            <TagsInput
                                value={field.value || []}
                                onChange={(tags) => field.onChange(tags)}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='isQnA'
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className='flex items-center'>
                                    <Checkbox
                                        checked={field.value || false}
                                        onCheckedChange={(checked) =>
                                            field.onChange(Boolean(checked))
                                        }
                                    />
                                    <Label className='ml-2'>Q&A</Label>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='threadCategory'
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <ComboBox
                                    value={field.value as ThreadCategory}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type='submit' className='px-8'>
                    Save Changes
                </Button>
            </form>
        </Form>
    );
};
