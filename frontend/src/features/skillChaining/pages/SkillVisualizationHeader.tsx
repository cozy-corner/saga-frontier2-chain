import React from 'react';
import { SmartSearch } from '@features/skillChaining/skills/components/SmartSearch';
import { SkillWithCategory } from '@api/hooks/useAllSkills';

// Define SkillSuggestion to match what SmartSearch expects
interface SkillSuggestion {
  name: string;
  category?: string;
}

interface SkillVisualizationHeaderProps {
  title: string;
  onSelectSkill: (skillName: string) => void;
  allSkills: SkillWithCategory[];
  loading: boolean;
}

export const SkillVisualizationHeader: React.FC<SkillVisualizationHeaderProps> = ({
  title,
  onSelectSkill,
  allSkills,
  loading
}) => {
  // The allSkills is already in the correct format for SmartSearch
  const skillSuggestions: SkillSuggestion[] = allSkills;

  return (
    <div className="skill-visualization-header">
      <h2>{title}</h2>
      <div className="skill-search">
        <SmartSearch 
          onSelectSkill={onSelectSkill}
          allSkills={skillSuggestions}
          loading={loading}
        />
      </div>
    </div>
  );
};
