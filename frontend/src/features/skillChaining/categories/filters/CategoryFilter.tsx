import React from 'react';
import { getCategoryColor } from '../hooks/categoryColors';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  setSelectedCategories
}) => {
  return (
    <div className="category-filter">
      <div className="category-filter-header">
        <h4>カテゴリフィルター</h4>
        <div className="category-filter-actions">
          {selectedCategories.length < categories.length && (
            <button 
              className="select-all-btn" 
              onClick={() => setSelectedCategories(categories)}
            >
              すべて選択
            </button>
          )}
          {selectedCategories.length > 0 && (
            <button 
              className="clear-all-btn" 
              onClick={() => setSelectedCategories([])}
            >
              すべて解除
            </button>
          )}
        </div>
      </div>
      <div className="category-checkbox-list">
        {categories.map(category => (
          <div key={category} className="category-checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                aria-label={`Filter by ${category} category`}
                onChange={() => {
                  setSelectedCategories(prev => {
                    if (prev.includes(category)) {
                      return prev.filter(cat => cat !== category);
                    } else {
                      return [...prev, category];
                    }
                  });
                }}
              />
              <span 
                className="category-color" 
                style={{ 
                  '--category-bg': getCategoryColor(category).bg,
                  '--category-border': getCategoryColor(category).border
                } as React.CSSProperties}
              ></span>
              {category}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
