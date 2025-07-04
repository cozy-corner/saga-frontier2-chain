// API response types

export interface Category {
  name: string;
  order?: number;
  skills?: Skill[];
}

export interface Skill {
  name: string;
  category?: Category;
  linksTo?: Skill[];
  linkedBy?: Skill[];
  nonFinalName?: string; // Name used at beginning/middle of chain
  finalName?: string; // Name used at end of chain
}

// Query result types
export interface CategoriesQueryResult {
  categories: Category[];
}

export interface CategoryQueryResult {
  category: Category;
}

export interface SkillQueryResult {
  skill: Skill;
}

export interface LinkedFromCategoriesQueryResult {
  skill: Skill;
  linkedFromCategories: Category[];
}

export interface LinkedSkillsByCategoryQueryResult {
  skill: Skill;
  category: Category;
}

export interface LinkedSkillsQueryResult {
  linkedSkills: Skill[];
}
