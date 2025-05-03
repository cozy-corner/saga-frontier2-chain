import React from 'react';
import { SkillFlowChart } from './SkillFlowChart';

interface VisualizationContentProps {
  graphSkill: string | null;
  selectedCategories: string[];
  onSkillSelect: (skillName: string) => void;
}

export const VisualizationContent: React.FC<VisualizationContentProps> = ({
  graphSkill,
  selectedCategories,
  onSkillSelect
}) => {
  return (
    <div className="visualization-container">
      {graphSkill ? (
        <SkillFlowChart 
          skillName={graphSkill} 
          selectedCategories={selectedCategories}
          onSkillSelect={onSkillSelect}
        />
      ) : (
        <div className="empty-state">
          <p className="notification">
            スキルを検索または選択して連携を表示してください
          </p>
          {selectedCategories.length > 0 && (
            <p className="selected-category">
              現在選択されているカテゴリ: <strong>{selectedCategories.join(', ')}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
