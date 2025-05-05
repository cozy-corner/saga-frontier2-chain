import React, { useCallback } from 'react';
import { useSkillStack } from '@features/skillChaining/context/SkillStackContext';
import { getCategoryColor } from '@features/skillChaining/utils/categoryColors';

// シンプルなスキルアイテムの型定義
interface SkillItem {
  name: string;
  category?: string;
}

interface StackedSkillsProps {
  allSkills: SkillItem[];
  onSkillClick?: (skillName: string, shouldAddToChain?: boolean) => void;
}

export function StackedSkills({ allSkills, onSkillClick }: StackedSkillsProps) {
  const { state: { selectedSkills }, dispatch } = useSkillStack();
  
  // 選択されたスキルの詳細情報を取得
  const selectedSkillDetails: SkillItem[] = selectedSkills.map(skillName => {
    const foundSkill = allSkills.find(skill => skill.name === skillName);
    if (foundSkill) {
      return foundSkill;
    }
    // スキルが見つからない場合はデフォルト値を返す
    return {
      name: skillName,
      category: 'default'
    };
  });
  
  // スキルクリックハンドラー - useCallbackでメモ化して不要な再作成を防止
  const handleSkillClick = useCallback((skillName: string, index: number) => {
    // スキルスタック内での選択位置を記録し、それより後ろのスキルを削除
    dispatch({ type: 'SELECT_STACK_SKILL', payload: index });
    
    // 選択したスキルの詳細ビューを表示する場合
    // スタック内でクリックした場合は常にチェーンに追加しない
    if (onSkillClick) {
      onSkillClick(skillName, false);
    }
  }, [dispatch, onSkillClick]);
  
  if (selectedSkills.length === 0) {
    return <div className="stacked-skills-empty">選択されたスキルがありません</div>;
  }
  
  return (
    <div className="stacked-skills-container">
      <h3>連携</h3>
      <div className="stacked-skills-list">
        {selectedSkillDetails.map((skill: SkillItem, index) => {
          // カテゴリ名を取得（文字列または未定義の場合はデフォルト値を使用）
          const categoryName = skill.category || 'default';
          const colors = getCategoryColor(categoryName);
          
          return (
            <div
              key={index}
              className="stacked-skill-item"
              role="button"
              tabIndex={0}
              aria-label={`Select skill ${skill.name}`}
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
              }}
              onClick={() => handleSkillClick(skill.name, index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSkillClick(skill.name, index);
                }
              }}
            >
              <span className="skill-name">{skill.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
