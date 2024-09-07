import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const TagsInput = ({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) => {
    const [input, setInput] = useState('');

    const handleAddTag = () => {
        const trimmedInput = input.trim();
        if (trimmedInput && !value.includes(trimmedInput)) {
            onChange([...value, trimmedInput]);
            setInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        onChange(value.filter(t => t !== tag));
    };

    return (
        <div>
            <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                    <Input
                        placeholder="Add tags (separate with commas)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                            }
                        }}
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
            <div className="mt-2">
                {value.map(tag => (
                    <span key={tag} className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-red-500">x</button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TagsInput;
