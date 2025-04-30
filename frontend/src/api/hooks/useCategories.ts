import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { CategoriesQueryResult } from '../types';

export function useCategories() {
  const { loading, error, data } = useQuery<CategoriesQueryResult>(GET_CATEGORIES);
  
  return {
    loading,
    error,
    categories: data?.categories || []
  };
}
