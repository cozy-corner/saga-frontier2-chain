import { ReactNode } from 'react';
import { Node, Edge } from 'reactflow';

// =============================================================================
// Common Patterns
// =============================================================================

/**
 * 共通のプロバイダープロパティ
 */
export interface ProviderProps {
  children: ReactNode;
}

/**
 * スキル選択時のコールバック関数の型
 */
export type OnSkillSelectCallback = (skillName: string, shouldAddToChain: boolean) => void;

/**
 * カテゴリ選択時のコールバック関数の型
 */
export type OnCategorySelectCallback = (category: string) => void;

// =============================================================================
// Node Data Types
// =============================================================================

/**
 * 基本ノードデータの型
 */
export interface BaseNodeData {
  label: string;
}

/**
 * スキルノードのデータ型
 */
export interface SkillNodeData extends BaseNodeData {
  category?: string;
  linkCount?: number;
}

/**
 * カテゴリノードのデータ型
 */
export interface CategoryNodeData extends BaseNodeData {
  color: {
    bg: string;
    border: string;
  };
}

// =============================================================================
// Hook Types
// =============================================================================

/**
 * グラフインタラクション用フックのプロパティ
 */
export interface UseGraphInteractionsProps {
  edges: Edge[];
  sourceSkillName: string;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setHighlightedNodes: React.Dispatch<React.SetStateAction<string[]>>;
  onSkillSelect?: OnSkillSelectCallback;
}

// =============================================================================
// Data Types
// =============================================================================

/**
 * 簡略化されたスキルアイテムの型
 */
export interface SkillItem {
  name: string;
  category?: string;
}

// =============================================================================
// Context State Types
// =============================================================================

/**
 * チェイン状態の型
 */
export interface ChainState {
  selectedCategory: string | null;
  selectedSkill: string | null;
  sourceSkill: string | null;
  isLinkMode: boolean;
}

/**
 * チェインアクションの型
 */
export type ChainAction =
  | { type: 'SELECT_CATEGORY'; payload: { name: string; fromLink?: boolean } }
  | { type: 'SELECT_SKILL'; payload: { name: string } }
  | { type: 'RESET' };

/**
 * チェインコンテキストの型
 */
export interface ChainContextType {
  state: ChainState;
  dispatch: React.Dispatch<ChainAction>;
}

/**
 * スキルスタック状態の型
 */
export interface SkillStackState {
  selectedSkills: string[];
}

/**
 * スキルスタックアクションの型
 */
export type SkillStackAction =
  | { type: 'ADD_SKILL'; payload: string }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'CLEAR_SKILLS' }
  | { type: 'SELECT_STACK_SKILL'; payload: number };

/**
 * スキルスタックコンテキストの型
 */
export interface SkillStackContextType {
  state: SkillStackState;
  dispatch: React.Dispatch<SkillStackAction>;
}

/**
 * グラフ状態の型
 */
export interface GraphState {
  graphSkill: string | null;
}

/**
 * グラフコンテキストの型
 */
export interface GraphContextType {
  state: GraphState;
  setGraphSkill: (skillName: string | null) => void;
}

// =============================================================================
// Graph Layout Types
// =============================================================================

/**
 * 円形レイアウトオプションの型
 */
export interface CircleLayoutOptions {
  centerX?: number;
  centerY?: number;
  minRadius?: number;
  baseRadius?: number;
  increment?: number;
}