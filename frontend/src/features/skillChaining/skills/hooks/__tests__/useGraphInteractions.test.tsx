import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { Node, Edge } from 'reactflow';
import { useGraphInteractions } from '../useGraphInteractions';

describe('useGraphInteractions', () => {
  // モック関数の設定
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockSetHighlightedNodes = vi.fn();
  const mockOnSkillSelect = vi.fn();

  // テスト用のノードとエッジ
  const testNodes: Node[] = [
    { id: 'source_裏拳', data: { label: '裏拳' }, position: { x: 250, y: 250 } },
    { id: '胴抜き', data: { label: '胴抜き' }, position: { x: 350, y: 250 } },
    { id: '切り返し', data: { label: '切り返し' }, position: { x: 150, y: 250 } },
  ];

  const testEdges: Edge[] = [
    { id: '裏拳-to-胴抜き', source: 'source_裏拳', target: '胴抜き' },
    { id: '裏拳-to-切り返し', source: 'source_裏拳', target: '切り返し' },
  ];

  const defaultProps = {
    edges: testEdges,
    sourceSkillName: '裏拳',
    setNodes: mockSetNodes,
    setEdges: mockSetEdges,
    setHighlightedNodes: mockSetHighlightedNodes,
    onSkillSelect: mockOnSkillSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onNodeMouseEnter', () => {
    it('ホバーしたノードと関連するノードをハイライトする', () => {
      const { result } = renderHook(() => useGraphInteractions(defaultProps));

      act(() => {
        result.current.onNodeMouseEnter({} as React.MouseEvent, testNodes[0]);
      });

      // ハイライトされたノードの設定を確認
      expect(mockSetHighlightedNodes).toHaveBeenCalledWith(['source_裏拳', '胴抜き', '切り返し']);

      // ノードのクラス名更新を確認
      expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function));
      const nodeUpdater = mockSetNodes.mock.calls[0][0];
      const updatedNodes = nodeUpdater(testNodes);
      
      expect(updatedNodes[0].className).toBe('highlighted-node');
      expect(updatedNodes[1].className).toBe('highlighted-node');
      expect(updatedNodes[2].className).toBe('highlighted-node');
    });

    it('関連するエッジをアニメーション付きでハイライトする', () => {
      const { result } = renderHook(() => useGraphInteractions(defaultProps));

      act(() => {
        result.current.onNodeMouseEnter({} as React.MouseEvent, testNodes[1]); // 胴抜きをホバー
      });

      // エッジの更新を確認
      expect(mockSetEdges).toHaveBeenCalledWith(expect.any(Function));
      const edgeUpdater = mockSetEdges.mock.calls[0][0];
      const updatedEdges = edgeUpdater(testEdges);

      // 胴抜きに関連するエッジだけがハイライトされる
      expect(updatedEdges[0].animated).toBe(true);
      expect(updatedEdges[0].style?.opacity).toBe(1);
      expect(updatedEdges[1].animated).toBe(false);
      expect(updatedEdges[1].style?.opacity).toBe(0.1);
    });

    it('エラーが発生してもクラッシュしない', () => {
      const { result } = renderHook(() => useGraphInteractions(defaultProps));
      
      // エラーを発生させるためにnullを渡す
      expect(() => {
        act(() => {
          result.current.onNodeMouseEnter({} as React.MouseEvent, { 
            id: null as unknown as string, 
            position: { x: 0, y: 0 },
            data: {}
          } as Node);
        });
      }).not.toThrow();
    });

    it('Setを使用して効率的にエッジをフィルタリングする', () => {
      const manyEdges = Array.from({ length: 100 }, (_, i) => ({
        id: `edge-${i}`,
        source: i < 50 ? 'source_裏拳' : 'other',
        target: `node-${i}`,
      }));

      const { result } = renderHook(() => 
        useGraphInteractions({ ...defaultProps, edges: manyEdges })
      );

      const startTime = performance.now();
      act(() => {
        result.current.onNodeMouseEnter({} as React.MouseEvent, testNodes[0]);
      });
      const endTime = performance.now();

      // パフォーマンスが改善されていることを確認（タイムアウトしない）
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('onNodeMouseLeave', () => {
    it('すべてのノードとエッジを元の状態に戻す', () => {
      const { result } = renderHook(() => useGraphInteractions(defaultProps));

      act(() => {
        result.current.onNodeMouseLeave();
      });

      // ノードのクラス名がリセットされることを確認
      expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function));
      const nodeUpdater = mockSetNodes.mock.calls[0][0];
      const updatedNodes = nodeUpdater(testNodes);
      
      updatedNodes.forEach((node: Node) => {
        expect(node.className).toBe('');
      });

      // エッジのスタイルがリセットされることを確認
      expect(mockSetEdges).toHaveBeenCalledWith(expect.any(Function));
      const edgeUpdater = mockSetEdges.mock.calls[0][0];
      const updatedEdges = edgeUpdater(testEdges);
      
      updatedEdges.forEach((edge: Edge) => {
        expect(edge.style?.opacity).toBe(1);
        expect(edge.style?.zIndex).toBe(0);
      });

      // ハイライトされたノードがソーススキルのみになることを確認
      expect(mockSetHighlightedNodes).toHaveBeenCalledWith(['裏拳']);
    });
  });

  describe('onNodeClick', () => {
    it('スキルノードクリック時にonSkillSelectを呼び出す', () => {
      const { result } = renderHook(() => useGraphInteractions(defaultProps));

      act(() => {
        result.current.onNodeClick({} as React.MouseEvent, testNodes[1]); // 胴抜きをクリック
      });

      expect(mockOnSkillSelect).toHaveBeenCalledWith('胴抜き', true);
    });

    it('中心ノードクリック時はshouldAddToChainがfalseになる', () => {
      const { result } = renderHook(() => useGraphInteractions(defaultProps));

      act(() => {
        result.current.onNodeClick({} as React.MouseEvent, testNodes[0]); // source_裏拳をクリック
      });

      expect(mockOnSkillSelect).toHaveBeenCalledWith('裏拳', false);
    });

    it('onSkillSelectが未定義でもエラーにならない', () => {
      const propsWithoutCallback = { ...defaultProps, onSkillSelect: undefined };
      const { result } = renderHook(() => useGraphInteractions(propsWithoutCallback));

      expect(() => {
        act(() => {
          result.current.onNodeClick({} as React.MouseEvent, testNodes[1]);
        });
      }).not.toThrow();
    });

    it('無効なノードデータでもクラッシュしない', () => {
      const { result } = renderHook(() => useGraphInteractions(defaultProps));

      // データなしのノード
      expect(() => {
        act(() => {
          result.current.onNodeClick({} as React.MouseEvent, { id: 'test' } as Node);
        });
      }).not.toThrow();

      // ラベルが文字列でないノード
      expect(() => {
        act(() => {
          result.current.onNodeClick({} as React.MouseEvent, { 
            id: 'test', 
            data: { label: 123 as unknown as string },
            position: { x: 0, y: 0 }
          } as Node);
        });
      }).not.toThrow();

      expect(mockOnSkillSelect).not.toHaveBeenCalled();
    });
  });

  describe('依存関係とメモ化', () => {
    it('依存関係が変わらない限り関数参照が保持される', () => {
      const { result, rerender } = renderHook(
        (props) => useGraphInteractions(props),
        { initialProps: defaultProps }
      );

      const initialHandlers = {
        onNodeMouseEnter: result.current.onNodeMouseEnter,
        onNodeMouseLeave: result.current.onNodeMouseLeave,
        onNodeClick: result.current.onNodeClick,
      };

      // 同じpropsで再レンダリング
      rerender(defaultProps);

      expect(result.current.onNodeMouseEnter).toBe(initialHandlers.onNodeMouseEnter);
      expect(result.current.onNodeMouseLeave).toBe(initialHandlers.onNodeMouseLeave);
      expect(result.current.onNodeClick).toBe(initialHandlers.onNodeClick);
    });

    it('edgesが変更されたときonNodeMouseEnterが更新される', () => {
      const { result, rerender } = renderHook(
        (props) => useGraphInteractions(props),
        { initialProps: defaultProps }
      );

      const initialHandler = result.current.onNodeMouseEnter;

      // edgesを変更
      const newEdges = [...testEdges, { 
        id: 'new-edge', 
        source: 'source_裏拳', 
        target: 'new-node' 
      }];
      
      rerender({ ...defaultProps, edges: newEdges });

      expect(result.current.onNodeMouseEnter).not.toBe(initialHandler);
    });
  });
});