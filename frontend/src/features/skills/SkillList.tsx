import React from 'react';
import { useSkillsByCategory } from '../../api/hooks/useSkillsByCategory';
import { useLinkedSkills } from '../../api/hooks/useLinkedSkills';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { List } from '../../components/ui/List';

interface SkillListProps {
  categoryName: string;
  onSelectSkill: (skillName: string) => void;
  selectedSkill: string | null;
  sourceSkill?: string | null;
  isLinkMode?: boolean;
}

export function SkillList({ 
  categoryName, 
  onSelectSkill, 
  selectedSkill,
  sourceSkill = null,
  isLinkMode = false
}: SkillListProps) {
  // For regular category browsing
  const categorySkills = useSkillsByCategory(isLinkMode ? null : categoryName);
  
  // For linked skills in chain mode
  const linkedSkills = useLinkedSkills(isLinkMode ? sourceSkill : null, categoryName);
  
  // Determine which data source to use based on mode
  const { loading, error, skills } = isLinkMode && sourceSkill ? 
    { 
      loading: linkedSkills.loading, 
      error: linkedSkills.error, 
      skills: linkedSkills.linkedSkills 
    } : 
    { 
      loading: categorySkills.loading, 
      error: categorySkills.error, 
      skills: categorySkills.skills 
    };
  
  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error.message} />;
  
  if (skills.length === 0) {
    return <p>{isLinkMode ? 'このカテゴリに連携する技はありません' : '技がありません'}</p>;
  }
  
  return (
    <List className="skill-list">
      {skills.map(skill => (
        <List.Item
          key={skill.name}
          selected={selectedSkill === skill.name}
          onClick={() => onSelectSkill(skill.name)}
        >
          {skill.name}
        </List.Item>
      ))}
    </List>
  );
}
