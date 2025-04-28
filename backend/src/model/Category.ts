// backend/src/model/Category.ts
import { CategoryType, SkillType } from './types';

export class Category implements CategoryType {
  name: string;
  skills?: SkillType[];

  constructor(name: string, skills?: SkillType[]) {
    this.name = name;
    this.skills = skills;
  }
}
