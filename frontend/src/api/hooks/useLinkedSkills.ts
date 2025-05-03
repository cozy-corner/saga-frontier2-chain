import { useQuery } from '@apollo/client';
import { GET_LINKED_SKILLS, GET_LINKED_SKILLS_BY_CATEGORY } from '../graphql/queries';
import { LinkedSkillsQueryResult, LinkedSkillsByCategoryQueryResult } from '../types';

export function useLinkedSkills(sourceSkillName: string | null, categoryName: string | null) {
  // カテゴリが指定されている場合はカテゴリ指定クエリを使用
  const { loading: loadingWithCategory, error: errorWithCategory, data: dataWithCategory } = useQuery<LinkedSkillsByCategoryQueryResult>(
    GET_LINKED_SKILLS_BY_CATEGORY,
    {
      variables: { 
        skillName: sourceSkillName || '', 
        categoryName: categoryName || ''
      },
      skip: !sourceSkillName || !categoryName // スキルとカテゴリの両方がある場合のみ実行
    }
  );
  
  // カテゴリが指定されていない場合は全連携スキル取得クエリを使用
  const { loading: loadingWithoutCategory, error: errorWithoutCategory, data: dataWithoutCategory } = useQuery<LinkedSkillsQueryResult>(
    GET_LINKED_SKILLS,
    {
      variables: { 
        skillName: sourceSkillName || ''
      },
      skip: !sourceSkillName || !!categoryName // スキルがあり、カテゴリがない場合のみ実行
    }
  );
  
  // 読み込み状態やエラー状態の統合
  const loading = loadingWithCategory || loadingWithoutCategory;
  const error = errorWithCategory || errorWithoutCategory;
  
  // データソースの選択
  let linkedSkills = [];
  if (categoryName) {
    linkedSkills = dataWithCategory?.skill?.linksTo || [];
  } else {
    linkedSkills = dataWithoutCategory?.linkedSkills || [];
  }
  
  return {
    loading,
    error,
    linkedSkills
  };
}
