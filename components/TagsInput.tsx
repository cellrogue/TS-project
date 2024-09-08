import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const predefinedTags = ['JavaScript', 'React', 'Next.js', 'Firebase', 'AI', 'VR', 'API']; 

const TagsInput = ({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) => {
    const [input, setInput] = useState('');

    const handleAddOrRemoveTag = (tag: string) => {
        if (value.includes(tag)) {
            onChange(value.filter(t => t !== tag));
        } else {
            onChange([...value, tag]);
        }
    };

    const handleInputAddTag = () => {
        if (input.trim() && !value.includes(input.trim())) {
            onChange([...value, input.trim()]);
            setInput('');
        }
    };

    return (
        <div>
            <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                    <Input
                        placeholder="Add tags (comma separated)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleInputAddTag();
                            }
                        }}
                    />
                </FormControl>
            </FormItem>

            <div className="mt-2">
                <div className="flex gap-2">
                    {predefinedTags.map((tag) => (
                        <span
                            key={tag}
                            className={`inline-block bg-gray-200 text-sm text-muted-foreground text-gray-700 px-2 py-1 rounded cursor-pointer ${
                                value.includes(tag) ? 'bg-purple-400 text-white' : 'hover:bg-gray-300'
                            }`}
                            onClick={() => handleAddOrRemoveTag(tag)}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TagsInput;
