import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_CATEGORIES } from '../graphql/queries';
import { CategoriesQueryResult } from '../types';

export function useCategories() {
  const { loading, error, data } = useQuery<CategoriesQueryResult>(GET_CATEGORIES);
  
  const sortedCategories = useMemo(() => {
    if (!data?.categories) return [];
    
    // Create a copy and sort by order (fallback to 999 if order is undefined)
    return [...data.categories].sort((a, b) => 
      (a.order ?? 999) - (b.order ?? 999)
    );
  }, [data]);
  
  return {
    loading,
    error,
    categories: sortedCategories
  };
}
