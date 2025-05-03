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
  
  // デバッグ用ログ出力
  if (categoryName) {
    console.log('カテゴリ指定クエリ - API返却データ:', JSON.stringify(dataWithCategory, null, 2));
    
    if (dataWithCategory?.skill?.linksTo) {
      console.log('カテゴリ指定 - スキル数:', dataWithCategory.skill.linksTo.length);
      console.log('スキルの名前一覧:', dataWithCategory.skill.linksTo.map(s => s.name));
      
      // カテゴリ情報のチェック
      const missingCategoryCount = dataWithCategory.skill.linksTo.filter(s => !s.category).length;
      if (missingCategoryCount > 0) {
        console.log('カテゴリ情報がないスキル:', dataWithCategory.skill.linksTo.filter(s => !s.category).map(s => s.name));
      }
    }
  } else {
    console.log('カテゴリなしクエリ - API返却データ:', JSON.stringify(dataWithoutCategory, null, 2));
    
    if (dataWithoutCategory?.linkedSkills) {
      console.log('カテゴリなし - スキル数:', dataWithoutCategory.linkedSkills.length);
      console.log('スキルの名前一覧:', dataWithoutCategory.linkedSkills.map(s => s.name));
    }
  }
  
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
