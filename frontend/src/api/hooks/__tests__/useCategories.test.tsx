import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GET_CATEGORIES } from '../../graphql/queries';
import { useCategories } from '../useCategories';

describe('useCategories', () => {
  // テスト用のカテゴリデータ
  const TEST_CATEGORIES = [
    { name: '体', order: 1 },
    { name: '剣', order: 3 },
    { name: '斧', order: 5 },
    { name: '杖', order: 6 },
    { name: '槍', order: 7 }
  ];

  // 成功時のモックレスポンス
  const successMock = {
    request: {
      query: GET_CATEGORIES
    },
    result: {
      data: {
        categories: TEST_CATEGORIES
      }
    }
  };

  // エラー時のモックレスポンス
  const errorMock = {
    request: {
      query: GET_CATEGORIES
    },
    error: new Error('カテゴリデータの取得に失敗しました')
  };

  it('データをロード中は適切なローディング状態を返す', () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      )
    });

    // フックが初期状態を返すことを確認
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(result.current.categories).toEqual([]);
  });

  it('データのロードに成功した場合、カテゴリのリストを返す', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      )
    });

    // データがロードされるまで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 結果を検証
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.categories).toEqual(TEST_CATEGORIES);
  });

  it('データのロードに失敗した場合、エラーを返す', async () => {
    const { result } = renderHook(() => useCategories(), {
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
    expect(result.current.categories).toEqual([]);
  });
});
