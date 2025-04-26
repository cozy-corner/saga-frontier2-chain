// backend/src/model/types.ts

// Define interfaces that will be implemented by the classes
export interface ISkill {
  name: string;
  category?: ICategory;
  linksTo?: ISkill[];
}

export interface ICategory {
  name: string;
  skills?: ISkill[];
}
