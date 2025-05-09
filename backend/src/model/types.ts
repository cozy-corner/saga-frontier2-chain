// backend/src/model/types.ts

export interface SkillType {
  name: string;
  category?: CategoryType;
  linksTo: SkillType[];
}

export interface CategoryType {
  name: string;
  skills: SkillType[];
}
