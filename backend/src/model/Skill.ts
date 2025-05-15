// backend/src/model/Skill.ts
import { SkillType, Waza, CategoryType } from './types';

// 既存のコードとの互換性を維持するためのクラス
// 暫定的にWaza型として扱う（将来的なスキーマ変更後に個別対応）
export class Skill implements Waza {
  name: string;
  category?: CategoryType;
  linksTo: SkillType[];
  type: 'waza' = 'waza'; // 固定値
  wp: number;

  constructor(
    name: string, 
    category?: CategoryType, 
    linksTo: SkillType[] = [],
    wp: number = 0 // デフォルト値
  ) {
    this.name = name;
    this.category = category;
    this.linksTo = linksTo;
    this.wp = wp;
  }
}
