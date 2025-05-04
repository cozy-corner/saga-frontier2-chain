import React from 'react';
import { getCategoryColor } from '../../utils/categoryColors';

interface SelectedCategoryTagsProps {
  selectedCategories: string[];
  onRemoveCategory: (category: string) => void;
}

export const SelectedCategoryTags: React.FC<SelectedCategoryTagsProps> = ({
  selectedCategories,
  onRemoveCategory
}) => {
  if (selectedCategories.length === 0) {
    return null;
  }

  return (
    <div className="selected-categories-info">
      <div className="selected-category-tags">
        {selectedCategories.map(cat => {
          const colors = getCategoryColor(cat);
          return (
            <span 
              key={cat} 
              className="selected-category-tag" 
              style={{ 
                '--category-bg': colors.bg,
                '--category-border': colors.border,
                color: '#333'
              } as React.CSSProperties}
            >
              {cat}
              <button 
                className="remove-category" 
                onClick={() => onRemoveCategory(cat)}
                aria-label={`${cat}を削除`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
};
