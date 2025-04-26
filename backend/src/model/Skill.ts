// backend/src/model/Skill.ts
import { ISkill, ICategory } from './types';

export class Skill implements ISkill {
  name: string;
  category?: ICategory;
  linksTo?: ISkill[];

  constructor(name: string, category?: ICategory, linksTo?: ISkill[]) {
    this.name = name;
    this.category = category;
    this.linksTo = linksTo;
  }
}
