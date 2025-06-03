import { describe, it, expect } from 'vitest';
import { generateChainName, hasChainNameData, allHaveChainNameData } from '../skillChainNameUtils';
import { Skill } from '@api/types';

describe('skillChainNameUtils', () => {
  describe('generateChainName', () => {
    it('空の配列の場合は空文字を返す', () => {
      expect(generateChainName([])).toBe('');
    });

    it('nullまたはundefinedの場合は空文字を返す', () => {
      expect(generateChainName(null as any)).toBe('');
      expect(generateChainName(undefined as any)).toBe('');
    });

    it('単体スキルの場合はそのままスキル名を返す', () => {
      const skill: Skill = {
        name: '胴抜き',
        nonFinalName: '胴',
        finalName: '抜き'
      };
      expect(generateChainName([skill])).toBe('胴抜き');
    });

    it('2つのスキルの連携名を正しく生成する', () => {
      const skills: Skill[] = [
        {
          name: '胴抜き',
          nonFinalName: '胴',
          finalName: '抜き'
        },
        {
          name: '熊掌打',
          nonFinalName: '熊',
          finalName: '掌打'
        }
      ];
      expect(generateChainName(skills)).toBe('胴掌打');
    });

    it('3つのスキルの連携名を正しく生成する', () => {
      const skills: Skill[] = [
        {
          name: '切り返し',
          nonFinalName: '返し',
          finalName: '返し'
        },
        {
          name: '十字斬り',
          nonFinalName: '十字',
          finalName: '十字'
        },
        {
          name: '大木断',
          nonFinalName: '大木',
          finalName: '断'
        }
      ];
      expect(generateChainName(skills)).toBe('返し十字断');
    });

    it('連携名データがないスキルの場合は元の名前を使用する', () => {
      const skills: Skill[] = [
        {
          name: '裏拳'
          // nonFinalName, finalNameがない
        },
        {
          name: 'キックラッシュ'
          // nonFinalName, finalNameがない
        }
      ];
      expect(generateChainName(skills)).toBe('裏拳キックラッシュ');
    });

    it('一部のスキルのみ連携名データがある場合', () => {
      const skills: Skill[] = [
        {
          name: '胴抜き',
          nonFinalName: '胴',
          finalName: '抜き'
        },
        {
          name: 'キックラッシュ'
          // nonFinalName, finalNameがない
        },
        {
          name: '熊掌打',
          nonFinalName: '熊',
          finalName: '掌打'
        }
      ];
      expect(generateChainName(skills)).toBe('胴キックラッシュ掌打');
    });

    it('finalNameが空文字の場合', () => {
      const skills: Skill[] = [
        {
          name: '残像剣',
          nonFinalName: '残像',
          finalName: ''
        },
        {
          name: '剣風閃',
          nonFinalName: '剣風',
          finalName: ''
        }
      ];
      // 最後のスキルのfinalNameが空の場合は元の名前を使用
      expect(generateChainName(skills)).toBe('残像剣風閃');
    });
  });

  describe('hasChainNameData', () => {
    it('連携名データがある場合はtrueを返す', () => {
      const skill: Skill = {
        name: '胴抜き',
        nonFinalName: '胴',
        finalName: '抜き'
      };
      expect(hasChainNameData(skill)).toBe(true);
    });

    it('nonFinalNameのみある場合もtrueを返す', () => {
      const skill: Skill = {
        name: '残像剣',
        nonFinalName: '残像'
      };
      expect(hasChainNameData(skill)).toBe(true);
    });

    it('finalNameのみある場合もtrueを返す', () => {
      const skill: Skill = {
        name: 'デッドエンド',
        finalName: 'エンド'
      };
      expect(hasChainNameData(skill)).toBe(true);
    });

    it('連携名データがない場合はfalseを返す', () => {
      const skill: Skill = {
        name: 'キックラッシュ'
      };
      expect(hasChainNameData(skill)).toBe(false);
    });

    it('両方とも空文字の場合はfalseを返す', () => {
      const skill: Skill = {
        name: 'テスト',
        nonFinalName: '',
        finalName: ''
      };
      expect(hasChainNameData(skill)).toBe(false);
    });
  });

  describe('allHaveChainNameData', () => {
    it('全てのスキルが連携名データを持つ場合はtrueを返す', () => {
      const skills: Skill[] = [
        {
          name: '胴抜き',
          nonFinalName: '胴',
          finalName: '抜き'
        },
        {
          name: '熊掌打',
          nonFinalName: '熊',
          finalName: '掌打'
        }
      ];
      expect(allHaveChainNameData(skills)).toBe(true);
    });

    it('一部のスキルが連携名データを持たない場合はfalseを返す', () => {
      const skills: Skill[] = [
        {
          name: '胴抜き',
          nonFinalName: '胴',
          finalName: '抜き'
        },
        {
          name: 'キックラッシュ'
        }
      ];
      expect(allHaveChainNameData(skills)).toBe(false);
    });

    it('空の配列の場合はfalseを返す', () => {
      expect(allHaveChainNameData([])).toBe(false);
    });

    it('nullまたはundefinedの場合はfalseを返す', () => {
      expect(allHaveChainNameData(null as any)).toBe(false);
      expect(allHaveChainNameData(undefined as any)).toBe(false);
    });
  });
});