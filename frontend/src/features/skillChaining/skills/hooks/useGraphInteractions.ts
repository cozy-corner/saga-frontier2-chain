import { useCallback } from 'react';
import { NodeMouseHandler, Edge, Node } from 'reactflow';

interface UseGraphInteractionsProps {
  edges: Edge[];
  sourceSkillName: string;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setHighlightedNodes: React.Dispatch<React.SetStateAction<string[]>>;
  onSkillSelect?: (skillName: string, shouldAddToChain: boolean) => void;
}

/**
 * グラフのインタラクション（ホバー、クリック等）を管理するカスタムフック
 */
export function useGraphInteractions({
  edges,
  sourceSkillName,
  setNodes,
  setEdges,
  setHighlightedNodes,
  onSkillSelect
}: UseGraphInteractionsProps) {
  
  // ノードホバー時のハイライト処理
  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    try {
      // ホバーしたノードと直接関連するノードをハイライト
      const connectedEdges = edges.filter(e => 
        e.source === node.id || e.target === node.id
      );
      
      const relatedNodeIds = [
        node.id,
        ...connectedEdges.map(e => e.source === node.id ? e.target : e.source)
      ];
      
      setHighlightedNodes(relatedNodeIds);
      
      // 関連ノードの強調表示
      setNodes(nds => 
        nds.map(n => ({
          ...n,
          className: relatedNodeIds.includes(n.id) ? 'highlighted-node' : 'faded-node'
        }))
      );
      
      // 関連エッジの強調表示
      setEdges(eds => 
        eds.map(e => ({
          ...e,
          animated: connectedEdges.some(ce => ce.id === e.id),
          style: {
            ...e.style,
            opacity: connectedEdges.some(ce => ce.id === e.id) ? 1 : 0.1,
            zIndex: connectedEdges.some(ce => ce.id === e.id) ? 1 : 0
          }
        }))
      );
    } catch (error) {
      console.error('ノードホバー処理でエラーが発生しました:', error);
    }
  }, [edges, setNodes, setEdges, setHighlightedNodes]);
  
  // ノードホバー解除時の処理
  const onNodeMouseLeave = useCallback(() => {
    // 全てのノードとエッジを元の表示に戻す
    setNodes(nds => 
      nds.map(n => ({
        ...n,
        className: '', // クラス名をリセット
      }))
    );
    
    setEdges(eds => 
      eds.map(e => ({
        ...e,
        style: {
          ...e.style,
          opacity: 1,
          zIndex: 0
        }
      }))
    );
    
    setHighlightedNodes([sourceSkillName]);
  }, [sourceSkillName, setNodes, setEdges, setHighlightedNodes]);
  
  // ノードクリック時の処理
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    try {
      // ノードデータからスキル名を取得
      const clickedSkillName = node.data?.label;
      if (typeof clickedSkillName === 'string') {
        
        // ノードのIDに「source_」が含まれているかで判断
        const shouldAddToChain = !node.id.toString().startsWith('source_');
        
        if (onSkillSelect) {
          onSkillSelect(clickedSkillName, shouldAddToChain);
        }
      }
    } catch (error) {
      console.error('ノードクリック処理でエラーが発生しました:', error);
    }
  }, [onSkillSelect]);
  
  return {
    onNodeMouseEnter,
    onNodeMouseLeave,
    onNodeClick
  };
}