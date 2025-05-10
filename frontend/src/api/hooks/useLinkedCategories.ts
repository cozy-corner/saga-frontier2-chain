import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_SKILL_LINKED_CATEGORIES } from '../graphql/queries';
import { LinkedFromCategoriesQueryResult } from '../types';

export function useLinkedCategories(skillName: string | null) {
  const { loading, error, data } = useQuery<LinkedFromCategoriesQueryResult>(
    GET_SKILL_LINKED_CATEGORIES,
    {
      variables: { skillName },
      skip: !skillName
    }
  );
  
  const sortedLinkedCategories = useMemo(() => {
    if (!data?.linkedFromCategories) return [];
    
    // Create a copy and sort by order (fallback to 999 if order is undefined)
    return [...data.linkedFromCategories].sort((a, b) => 
      (a.order ?? 999) - (b.order ?? 999)
    );
  }, [data]);
  
  return {
    loading,
    error,
    linkedCategories: sortedLinkedCategories
  };
}
