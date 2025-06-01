import React from 'react';
import { CategoryFilter } from '../../categories/filters/CategoryFilter';
import { SelectedCategoryTags } from '../../categories/filters/SelectedCategoryTags';

interface CategoryFilterSectionProps {
  graphSkill: string | null;
  availableCategories: string[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onRemoveCategory: (category: string) => void;
}

/**
 * カテゴリフィルターセクションを表示するコンポーネント
 * スキルが選択されている場合のみ表示される
 */
export function CategoryFilterSection({
  graphSkill,
  availableCategories,
  selectedCategories,
  setSelectedCategories,
  onRemoveCategory
}: CategoryFilterSectionProps) {
  // スキルが選択されていない場合は何も表示しない
  if (!graphSkill) {
    return null;
  }
  
  return (
    <>
      <CategoryFilter 
        categories={availableCategories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      
      <SelectedCategoryTags 
        selectedCategories={selectedCategories}
        onRemoveCategory={onRemoveCategory}
      />
    </>
  );
}