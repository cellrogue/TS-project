import { ThreadCategory } from "@/app/types/thread";

// Utility function to reformat category title suitable for URL
export const formatCategoryforURL = (category: string) => {
    return category.toLowerCase().replace(/ /g, '-');
};

// Utility function to reformat category back to readable form

export const formatCategory = (category: string): ThreadCategory => {
    return decodeURIComponent(category)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') as ThreadCategory;
};
