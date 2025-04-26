// backend/src/model/Category.ts
import { ICategory, ISkill } from './types';

export class Category implements ICategory {
  name: string;
  skills?: ISkill[];

  constructor(name: string, skills?: ISkill[]) {
    this.name = name;
    this.skills = skills;
  }
}
