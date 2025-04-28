// backend/src/model/Skill.ts
import { SkillType, CategoryType } from './types';

export class Skill implements SkillType {
  name: string;
  category?: CategoryType;
  linksTo: SkillType[];

  constructor(name: string, category?: CategoryType, linksTo: SkillType[] = []) {
    this.name = name;
    this.category = category;
    this.linksTo = linksTo;
  }
}
