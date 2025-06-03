import { Skill } from '@api/types';

/**
 * スキルの連携名を生成する
 * @param skills - 連携するスキルの配列
 * @returns 連携名の文字列
 */
export function generateChainName(skills: Skill[]): string {
  if (!skills || skills.length === 0) {
    return '';
  }

  if (skills.length === 1) {
    // 単体スキルの場合はそのまま名前を返す
    return skills[0].name;
  }

  // 連携名を構築
  const chainParts: string[] = [];
  
  skills.forEach((skill, index) => {
    const isLast = index === skills.length - 1;
    
    if (isLast) {
      // 最後のスキルはfinalNameを使用
      chainParts.push(skill.finalName || skill.name);
    } else {
      // それ以外はnonFinalNameを使用
      chainParts.push(skill.nonFinalName || skill.name);
    }
  });

  return chainParts.join('');
}

/**
 * スキルが連携名データを持っているかチェック
 * @param skill - チェックするスキル
 * @returns 連携名データの有無
 */
export function hasChainNameData(skill: Skill): boolean {
  return !!(skill.nonFinalName || skill.finalName);
}

/**
 * 複数のスキルが全て連携名データを持っているかチェック
 * @param skills - チェックするスキルの配列
 * @returns 全てのスキルが連携名データを持っているか
 */
export function allHaveChainNameData(skills: Skill[]): boolean {
  if (!skills || skills.length === 0) {
    return false;
  }
  return skills.every(skill => hasChainNameData(skill));
}