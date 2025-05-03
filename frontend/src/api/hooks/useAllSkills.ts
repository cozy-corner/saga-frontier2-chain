import { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { GET_SKILLS_BY_CATEGORY } from '../graphql/queries';
import { CategoriesQueryResult, CategoryQueryResult } from '../types';

export interface SkillWithCategory {
  name: string;
  category?: string;
}

export function useAllSkills() {
  const client = useApolloClient();
  const [allSkills, setAllSkills] = useState<SkillWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAllSkills() {
      if (isMounted) setLoading(true);
      try {
        // まずカテゴリ一覧を取得
        const { data: categoriesData } = await client.query<CategoriesQueryResult>({
          query: GET_CATEGORIES
        });

        if (!categoriesData?.categories || categoriesData.categories.length === 0) {
          setAllSkills([]);
          return;
        }

        // Promise.allSettledを使用して並列にスキルを取得
        const results = await Promise.allSettled(
          categoriesData.categories.map(c => 
            client.query<CategoryQueryResult>({
              query: GET_SKILLS_BY_CATEGORY,
              variables: { categoryName: c.name }
            })
          )
        );
        
        // 結果を処理して全スキルリストを作成
        const allSkillsList: SkillWithCategory[] = [];
        
        results.forEach((result, index) => {
          const category = categoriesData.categories[index];
          
          if (result.status === 'fulfilled' && result.value.data?.category?.skills) {
            const formattedSkills = result.value.data.category.skills.map(skill => ({
              name: skill.name,
              category: category.name
            }));
            
            allSkillsList.push(...formattedSkills);
            console.log(`カテゴリ「${category.name}」のスキル ${formattedSkills.length}件を追加`);
          } else if (result.status === 'rejected') {
            console.error(`カテゴリ「${category.name}」のスキル取得エラー:`, result.reason);
          }
        });
        
        console.log('全スキルデータ取得完了:', allSkillsList.length);
        if (isMounted) {
          setAllSkills(allSkillsList);
          setError(null);
        }
      } catch (err) {
        console.error('スキルデータの取得エラー:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('スキルデータの取得に失敗しました'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAllSkills();
    
    // クリーンアップ関数: コンポーネントのアンマウント時に実行される
    return () => {
      isMounted = false;
    };
  }, [client]); // clientのみを依存配列に入れる

  return {
    allSkills,
    loading,
    error
  };
}
