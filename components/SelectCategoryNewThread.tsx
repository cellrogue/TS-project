'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ThreadCategory } from '../app/types/thread';

const categories: ThreadCategory[] = [
    'Software Development',
    'Networking & Security',
    'Hardware & Gadgets',
    'Cloud Computing',
    'Tech News & Trends',
];

interface ComboBoxProps {
    value: ThreadCategory | null;
    onChange: (value: ThreadCategory) => void;
}

export const ComboBox = ({ value, onChange }: ComboBoxProps) => {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-[200px] justify-between'>
                    {value
                        ? categories.find((category) => category === value)
                        : 'Select category...'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0'>
                <Command>
                    <CommandInput placeholder='Search category...' />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                            {categories.map((category) => (
                                <CommandItem
                                    key={category}
                                    value={category}
                                    onSelect={() => {
                                        onChange(category);
                                        setOpen(false);
                                    }}>
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === category
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                    {category}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
