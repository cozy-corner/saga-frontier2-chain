import React from 'react';
import { useCategories } from '../../api/hooks/useCategories';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { List } from '../../components/ui/List';

interface CategoryListProps {
  onSelectCategory: (categoryName: string) => void;
  selectedCategory: string | null;
}

export function CategoryList({ onSelectCategory, selectedCategory }: CategoryListProps) {
  const { loading, error, categories } = useCategories();
  
  if (loading) return <LoadingIndicator />;
  if (error) {
    const message =
      Array.isArray((error as any).graphQLErrors) && error.graphQLErrors.length
        ? error.graphQLErrors.map(e => e.message).join(', ')
        : error.message ?? 'Unexpected error';
    return <ErrorMessage message={message} />;
  }

  // ...rest of your component
}
  
  if (categories.length === 0) {
    return <p>カテゴリがありません</p>;
  }
  
  return (
    <List className="category-list">
      {categories.map(category => (
        <List.Item
          key={category.name}
          selected={selectedCategory === category.name}
          onClick={() => onSelectCategory(category.name)}
        >
          {category.name}
        </List.Item>
      ))}
    </List>
  );
}
