import { useQuery } from '@apollo/client';
import { GET_SKILLS_BY_CATEGORY } from '../graphql/queries';
import { Skill, CategoryQueryResult } from '../types';

export function useSkillsByCategory(categoryName: string | null) {
  const { loading, error, data } = useQuery<CategoryQueryResult>(
    GET_SKILLS_BY_CATEGORY, 
    {
      variables: { categoryName },
      skip: !categoryName
    }
  );
  
  return {
    loading,
    error,
    skills: data?.category?.skills || []
  };
}
