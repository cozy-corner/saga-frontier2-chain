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
    async function fetchAllSkills() {
      setLoading(true);
      try {
        // まずカテゴリ一覧を取得
        const { data: categoriesData } = await client.query<CategoriesQueryResult>({
          query: GET_CATEGORIES
        });

        if (!categoriesData?.categories || categoriesData.categories.length === 0) {
          setAllSkills([]);
          return;
        }

        const allSkillsList: SkillWithCategory[] = [];
        
        // 各カテゴリのスキルを順番に取得
        for (const category of categoriesData.categories) {
          try {
            // カテゴリごとにスキルを取得
            const { data: categoryData } = await client.query<CategoryQueryResult>({
              query: GET_SKILLS_BY_CATEGORY,
              variables: { categoryName: category.name }
            });

            if (categoryData?.category?.skills) {
              // スキルをフォーマットして追加
              const formattedSkills = categoryData.category.skills.map(skill => ({
                name: skill.name,
                category: category.name
              }));
              
              allSkillsList.push(...formattedSkills);
              console.log(`カテゴリ「${category.name}」のスキル ${formattedSkills.length}件を追加`);
            }
          } catch (categoryError) {
            console.error(`カテゴリ「${category.name}」のスキル取得エラー:`, categoryError);
          }
        }
        
        console.log('全スキルデータ取得完了:', allSkillsList.length);
        setAllSkills(allSkillsList);
        setError(null);
      } catch (err) {
        console.error('スキルデータの取得エラー:', err);
        setError(err instanceof Error ? err : new Error('スキルデータの取得に失敗しました'));
      } finally {
        setLoading(false);
      }
    }

    fetchAllSkills();
  }, [client]); // clientのみを依存配列に入れる

  return {
    allSkills,
    loading,
    error
  };
}
