// backend/src/model/Category.ts
import { CategoryType, SkillType } from './types';

export class Category implements CategoryType {
  name: string;
  skills: SkillType[];
  order: number;

  constructor(name: string, skills: SkillType[] = [], order: number = 0) {
    this.name = name;
    this.skills = skills;
    this.order = order;
  }
}
