// backend/src/model/types.ts

// スキルの共通インターフェース
export interface Skill {
  name: string;
  category?: CategoryType;
  linksTo: SkillType[];
}

/**
 * Represents a Waza skill type that consumes WP (Waza Points).
 */
export interface Waza extends Skill {
  type: 'waza';
  wp: number;
}

/**
 * Represents a JutsuWaza skill type that consumes JP (Jutsu Points).
 */
export interface Jutsuwaza extends Skill {
  type: 'jutsuwaza';
  jp: number;
}

/**
 * Represents a Jutsu skill type that consumes JP (Jutsu Points).
 */
export interface Jutsu extends Skill {
  type: 'jutsu';
  jp: number;
}

// スキルの具体的な型
export type SkillType = Waza | Jutsuwaza | Jutsu;

export interface CategoryType {
  name: string;
  skills: SkillType[];
  order: number;
}
