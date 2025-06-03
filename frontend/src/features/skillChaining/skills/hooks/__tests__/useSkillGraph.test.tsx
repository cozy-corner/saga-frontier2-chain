import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GET_LINKED_SKILLS } from '@api/graphql/queries';
import { useSkillGraph } from '../useSkillGraph';
import * as skillGraphUtils from '../../utils/skillGraphUtils';

// モックの設定
vi.mock('../../utils/skillGraphUtils', () => ({
  filterSkillsByCategories: vi.fn(),
  createSkillGraphData: vi.fn(),
  createEmptyGraphData: vi.fn(),
}));

describe('useSkillGraph', () => {
  // テスト用のスキルデータ（バックエンドのテストデータと同じ）
  const mockLinkedSkills = [
    {
      name: '胴抜き',
      nonFinalName: '胴',
      finalName: '抜き',
      category: { name: '体', order: 1 },
      linksTo: [{ 
        name: '熊掌打',
        nonFinalName: '熊',
        finalName: '掌打'
      }],
    },
    {
      name: '切り返し',
      nonFinalName: '返し',
      finalName: '返し',
      category: { name: '剣', order: 3 },
      linksTo: [
        { 
          name: '十字切り',
          nonFinalName: '十字',
          finalName: '切り'
        }, 
        { 
          name: '大木断',
          nonFinalName: '大木',
          finalName: '断'
        }
      ],
    },
  ];

  // GraphQLのモックレスポンス
  const successMock = {
    request: {
      query: GET_LINKED_SKILLS,
      variables: { skillName: '裏拳' },
    },
    result: {
      data: {
        linkedSkills: mockLinkedSkills,
      },
    },
  };

  const errorMock = {
    request: {
      query: GET_LINKED_SKILLS,
      variables: { skillName: '裏拳' },
    },
    error: new Error('Failed to fetch linked skills'),
  };

  // テスト前にモックをリセット
  beforeEach(() => {
    vi.clearAllMocks();
    
    // デフォルトのモック実装
    (skillGraphUtils.filterSkillsByCategories as ReturnType<typeof vi.fn>).mockImplementation((skills, categories) => {
      if (categories.length === 0) return skills;
      return skills.filter((skill: { category?: { name: string } }) => categories.includes(skill.category?.name));
    });
    
    (skillGraphUtils.createSkillGraphData as ReturnType<typeof vi.fn>).mockReturnValue({
      nodes: [
        { id: 'source_裏拳', data: { label: '裏拳' }, position: { x: 250, y: 250 } },
        { id: '胴抜き', data: { label: '胴抜き' }, position: { x: 350, y: 250 } },
      ],
      edges: [
        { id: '裏拳-to-胴抜き', source: 'source_裏拳', target: '胴抜き' },
      ],
    });
    
    (skillGraphUtils.createEmptyGraphData as ReturnType<typeof vi.fn>).mockReturnValue({
      nodes: [
        { id: 'source_裏拳', data: { label: '裏拳' }, position: { x: 250, y: 250 } },
      ],
      edges: [],
    });
  });

  it('初期状態では空のノードとエッジを返す', () => {
    const { result } = renderHook(() => useSkillGraph('裏拳', []), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      ),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it('データ取得成功時にグラフデータを生成する', async () => {
    const { result } = renderHook(() => useSkillGraph('裏拳', []), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.filteredSkills).toEqual(mockLinkedSkills);
    expect(result.current.linkedSkills).toEqual(mockLinkedSkills);
    
    // ユーティリティ関数が正しく呼ばれたことを確認
    expect(skillGraphUtils.filterSkillsByCategories).toHaveBeenCalledWith(mockLinkedSkills, []);
    expect(skillGraphUtils.createSkillGraphData).toHaveBeenCalledWith('裏拳', mockLinkedSkills, mockLinkedSkills);
  });

  it('カテゴリフィルタが適用される', async () => {
    const { result } = renderHook(() => useSkillGraph('裏拳', ['体']), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // フィルタリング関数が正しいパラメータで呼ばれたことを確認
    expect(skillGraphUtils.filterSkillsByCategories).toHaveBeenCalledWith(mockLinkedSkills, ['体']);
  });

  it('フィルタ結果が空の場合、空のグラフデータを生成する', async () => {
    // フィルタが空の配列を返すようにモック
    (skillGraphUtils.filterSkillsByCategories as ReturnType<typeof vi.fn>).mockReturnValue([]);
    
    const { result } = renderHook(() => useSkillGraph('裏拳', ['槍']), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[successMock]}>
          {children}
        </MockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 空のグラフデータ生成関数が呼ばれたことを確認
    expect(skillGraphUtils.createEmptyGraphData).toHaveBeenCalledWith('裏拳');
  });

  it('エラー時は空のノードとエッジを返す', async () => {
    const { result } = renderHook(() => useSkillGraph('裏拳', []), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[errorMock]}>
          {children}
        </MockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it('スキル名が空の場合は空のデータを返す', () => {
    const { result } = renderHook(() => useSkillGraph('', []), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          {children}
        </MockedProvider>
      ),
    });

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });
});