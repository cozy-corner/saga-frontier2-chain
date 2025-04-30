import { useQuery } from '@apollo/client';
import { GET_LINKED_SKILLS } from '../graphql/queries';
import { Skill, LinkedSkillsQueryResult } from '../types';

export function useLinkedSkills(sourceSkillName: string | null, categoryName: string | null) {
  const { loading, error, data } = useQuery<LinkedSkillsQueryResult>(
    GET_LINKED_SKILLS,
    {
      variables: { 
        skillName: sourceSkillName || '', 
        categoryName: categoryName || ''
      },
      skip: !sourceSkillName || !categoryName
    }
  );
  
  // Filter skills to only include those that belong to the specified category
  const linkedSkills = data?.skill?.linksTo?.filter(
    skill => skill.category?.name === categoryName
  ) || [];
  
  return {
    loading,
    error,
    linkedSkills
  };
}
