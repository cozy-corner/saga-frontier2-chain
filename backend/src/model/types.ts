// backend/src/model/types.ts

// スキルの共通インターフェース
export interface Skill {
  name: string;
  category?: CategoryType;
  linksTo: SkillType[];
}

// 技（WP消費）
export interface Waza extends Skill {
  type: 'waza';
  wp: number;
}

// 術技（JP消費）
export interface Jutsuwaza extends Skill {
  type: 'jutsuwaza';
  jp: number;
}

// 術（JP消費、合成術カテゴリ）
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
