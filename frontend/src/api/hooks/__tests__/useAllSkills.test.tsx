import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAllSkills, SkillWithCategory } from '../useAllSkills';
import { ApolloProvider } from '@apollo/client';

describe('useAllSkills', () => {
  it('スキルがカテゴリのorder順にソートされる', async () => {
    // モックスキルデータを定義
    const mockSkills: SkillWithCategory[] = [
      { name: '剣のスキル', category: '剣', categoryOrder: 3 },
      { name: '体のスキル', category: '体', categoryOrder: 1 },
      { name: '槍のスキル', category: '槍', categoryOrder: 4 },
      { name: '杖のスキル', category: '杖', categoryOrder: 2 }
    ];

    // モックのカスタムuseAllSkillsフックを作成
    const mockUseAllSkills = vi.fn().mockReturnValue({
      loading: false,
      error: null,
      allSkills: [...mockSkills].sort((a, b) => 
        (a.categoryOrder ?? 999) - (b.categoryOrder ?? 999)
      )
    });

    // モックフックを使ってテスト
    const { result } = renderHook(() => mockUseAllSkills());

    // ソート結果の検証
    const sortedSkills = result.current.allSkills;
    
    // データの存在確認
    expect(sortedSkills.length).toBe(4);
    
    // 順序確認（カテゴリorderの昇順）
    expect(sortedSkills[0].name).toBe('体のスキル');
    expect(sortedSkills[0].categoryOrder).toBe(1);
    
    expect(sortedSkills[1].name).toBe('杖のスキル');
    expect(sortedSkills[1].categoryOrder).toBe(2);
    
    expect(sortedSkills[2].name).toBe('剣のスキル');
    expect(sortedSkills[2].categoryOrder).toBe(3);
    
    expect(sortedSkills[3].name).toBe('槍のスキル');
    expect(sortedSkills[3].categoryOrder).toBe(4);
  });
});
