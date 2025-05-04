import React from 'react';
import { useLinkedCategories } from '../../../../api/hooks/useLinkedCategories';
import { LoadingIndicator } from '../../../../components/common/LoadingIndicator';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { List } from '../../../../components/ui/List';

interface LinkedCategoriesProps {
  skillName: string;
  onSelectCategory: (categoryName: string, fromLink?: boolean) => void;
}

export function LinkedCategories({ skillName, onSelectCategory }: LinkedCategoriesProps) {
  const { loading, error, linkedCategories } = useLinkedCategories(skillName);
  
  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error.message} />;
  
  if (linkedCategories.length === 0) {
    return <p>連携先カテゴリはありません</p>;
  }
  
  return (
    <List className="linked-categories">
      {linkedCategories.map(category => (
        <List.Item
          key={category.name}
          className="clickable"
          onClick={() => onSelectCategory(category.name, true)}
        >
          {category.name}
        </List.Item>
      ))}
    </List>
  );
}
