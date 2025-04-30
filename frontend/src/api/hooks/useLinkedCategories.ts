import { useQuery } from '@apollo/client';
import { GET_SKILL_LINKED_CATEGORIES } from '../graphql/queries';
import { Category, LinkedFromCategoriesQueryResult } from '../types';

export function useLinkedCategories(skillName: string | null) {
  const { loading, error, data } = useQuery<LinkedFromCategoriesQueryResult>(
    GET_SKILL_LINKED_CATEGORIES,
    {
      variables: { skillName },
      skip: !skillName
    }
  );
  
  return {
    loading,
    error,
    linkedCategories: data?.linkedFromCategories || []
  };
}
