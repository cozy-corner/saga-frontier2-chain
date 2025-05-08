import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GET_SKILL_LINKED_CATEGORIES } from '../../graphql/queries';
import { useLinkedCategories } from '../useLinkedCategories';

describe('useLinkedCategories', () => {
  // テスト用のスキルとリンクカテゴリデータ
  const TEST_SKILL_NAME = '裏拳';
  const TEST_LINKED_CATEGORIES = [
    { name: '体' },
    { name: '剣' }
  ];

  // 成功時のモックレスポンス
  const successMock = {
    request: {
      query: GET_SKILL_LINKED_CATEGORIES,
      variables: { skillName: TEST_SKILL_NAME }
    },
    result: {
      data: {
        skill: { name: TEST_SKILL_NAME },
        linkedFromCategories: TEST_LINKED_CATEGORIES
      }
    }
  };

  // エラー時のモックレスポンス
  const errorMock = {
    request: {
      query: GET_SKILL_LINKED_CATEGORIES,
      variables: { skillName: TEST_SKILL_NAME }
    },
    error: new Error('連携カテゴリの取得に失敗しました')
  };

  it('スキル名がnullの場合、クエリはスキップされ空の配列を返す', () => {
    const { result } = renderHook(() => useLinkedCategories(null), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          {children}
        </MockedProvider>
      )
    });

    // クエリがスキップされるため即座に結果が返る
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.linkedCategories).toEqual([]);
  });

  it('正しいスキル名が提供された場合、連携カテゴリを返す', async () => {
    const { result } = renderHook(() => useLinkedCategories(TEST_SKILL_NAME), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      )
    });

    // 初期状態はローディング中
    expect(result.current.loading).toBe(true);
    expect(result.current.linkedCategories).toEqual([]);

    // データがロードされるまで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 結果を検証
    expect(result.current.error).toBeUndefined();
    expect(result.current.linkedCategories).toEqual(TEST_LINKED_CATEGORIES);
  });

  it('クエリエラーが発生した場合、エラー状態を返す', async () => {
    const { result } = renderHook(() => useLinkedCategories(TEST_SKILL_NAME), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[errorMock]}>
          {children}
        </MockedProvider>
      )
    });

    // エラーが発生するまで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 結果を検証
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.linkedCategories).toEqual([]);
  });
  
  it('nullでクエリがスキップされ、後で正しいスキルを取得できる', async () => {
    // nullと有効なスキル名の両方に対するテスト
    const { result: nullResult } = renderHook(() => useLinkedCategories(null), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      )
    });

    // nullならスキップされる
    expect(nullResult.current.loading).toBe(false);
    expect(nullResult.current.linkedCategories).toEqual([]);

    // 有効なスキルでの別のレンダリング
    const { result: skillResult } = renderHook(() => useLinkedCategories(TEST_SKILL_NAME), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      )
    });

    // 初期状態はローディング中
    expect(skillResult.current.loading).toBe(true);
    
    // データがロードされるまで待機
    await waitFor(() => {
      expect(skillResult.current.loading).toBe(false);
    });
    
    // 結果の検証
    expect(skillResult.current.linkedCategories).toEqual(TEST_LINKED_CATEGORIES);
  });
});
