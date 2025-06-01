import { useState, useEffect, useRef, useCallback } from 'react';

export enum DisplayMode {
  CATEGORIES = 'categories',
  SKILLS = 'skills',
  FLOWCHART = 'flowchart'
}

/**
 * ビジュアライゼーションの表示モードを管理するカスタムフック
 * カテゴリー選択 -> スキル選択 -> フローチャート表示の流れを制御
 */
export function useVisualizationMode(graphSkill: string | null) {
  // 表示モード: カテゴリー -> スキル -> フローチャート
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    graphSkill ? DisplayMode.FLOWCHART : DisplayMode.CATEGORIES
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 現在のdisplayModeへの参照を保持
  const displayModeRef = useRef(displayMode);
  
  // displayModeが変更されたら参照を更新
  useEffect(() => {
    displayModeRef.current = displayMode;
  }, [displayMode]);
  
  // graphSkillが変わった時の処理
  useEffect(() => {
    if (graphSkill) {
      setDisplayMode(DisplayMode.FLOWCHART);
    } else if (!graphSkill && displayModeRef.current === DisplayMode.FLOWCHART) {
      setDisplayMode(DisplayMode.CATEGORIES);
    }
  }, [graphSkill]);

  // カテゴリー選択ハンドラ
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setDisplayMode(DisplayMode.SKILLS);
  }, []);

  // スキル選択による表示モード変更
  const switchToFlowChart = useCallback(() => {
    setDisplayMode(DisplayMode.FLOWCHART);
  }, []);

  return {
    displayMode,
    selectedCategory,
    handleCategorySelect,
    switchToFlowChart
  };
}