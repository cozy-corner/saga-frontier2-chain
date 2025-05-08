import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  skillStackReducer, 
  SkillStackProvider, 
  useSkillStack 
} from '../SkillStackContext';
import type { SkillStackState } from '../SkillStackContext';
import React, { ReactNode } from 'react';

const TEST_SKILLS = {
  体術: ['裏拳', '胴抜き', '熊掌打', 'ボコボコ', '鬼走り'],
  剣: ['切り返し', '十字切り', '追突剣', '払い抜け', 'スマッシュ'],
  MAX_LENGTH: 4
};

describe('skillStackReducer', () => {
  it('初期状態が正しい', () => {
    const initialState: SkillStackState = { selectedSkills: [] };
    expect(skillStackReducer(initialState, { type: 'CLEAR_SKILLS' })).toEqual(initialState);
  });
  
  it('スキルを追加できる', () => {
    const initialState: SkillStackState = { selectedSkills: [] };
    const newState = skillStackReducer(initialState, { type: 'ADD_SKILL', payload: TEST_SKILLS.体術[0] });
    expect(newState.selectedSkills).toContain(TEST_SKILLS.体術[0]);
    expect(newState.selectedSkills.length).toBe(1);
  });
  
  it('空のスキル名を追加しようとしても無視される', () => {
    const initialState: SkillStackState = { selectedSkills: [TEST_SKILLS.体術[0]] };
    const newState = skillStackReducer(initialState, { type: 'ADD_SKILL', payload: '  ' });
    expect(newState).toBe(initialState);
  });
  
  it('スキルを削除できる', () => {
    const initialState: SkillStackState = { selectedSkills: [TEST_SKILLS.体術[0], TEST_SKILLS.体術[1]] };
    const newState = skillStackReducer(initialState, { type: 'REMOVE_SKILL', payload: TEST_SKILLS.体術[0] });
    expect(newState.selectedSkills).not.toContain(TEST_SKILLS.体術[0]);
    expect(newState.selectedSkills).toContain(TEST_SKILLS.体術[1]);
    expect(newState.selectedSkills.length).toBe(1);
  });
  
  it('空のスキル名を削除しようとしても無視される', () => {
    const initialState: SkillStackState = { selectedSkills: [TEST_SKILLS.体術[0], TEST_SKILLS.体術[1]] };
    const newState = skillStackReducer(initialState, { type: 'REMOVE_SKILL', payload: '  ' });
    expect(newState).toBe(initialState);
  });
  
  it('存在しないスキルを削除しようとしても状態は変わらない', () => {
    const initialState: SkillStackState = { selectedSkills: [TEST_SKILLS.体術[0], TEST_SKILLS.体術[1]] };
    const newState = skillStackReducer(initialState, { type: 'REMOVE_SKILL', payload: '存在しないスキル' });
    expect(newState.selectedSkills).toEqual(initialState.selectedSkills);
  });
  
  it('最大スキル数を超えた場合、古いスキルが削除される', () => {
    const initialState: SkillStackState = { selectedSkills: TEST_SKILLS.体術.slice(0, TEST_SKILLS.MAX_LENGTH) };
    const newState = skillStackReducer(initialState, { type: 'ADD_SKILL', payload: TEST_SKILLS.体術[4] });
    expect(newState.selectedSkills).not.toContain(TEST_SKILLS.体術[0]);
    expect(newState.selectedSkills).toContain(TEST_SKILLS.体術[4]);
    expect(newState.selectedSkills.length).toBe(TEST_SKILLS.MAX_LENGTH);
  });
  
  it('スキルスタックをクリアできる', () => {
    const initialState: SkillStackState = { selectedSkills: TEST_SKILLS.体術.slice(0, 3) };
    const newState = skillStackReducer(initialState, { type: 'CLEAR_SKILLS' });
    expect(newState.selectedSkills).toEqual([]);
  });
  
  it('スタック内の指定されたインデックスまでのスキルを選択できる', () => {
    const initialState: SkillStackState = { selectedSkills: TEST_SKILLS.体術.slice(0, 4) };
    const newState = skillStackReducer(initialState, { type: 'SELECT_STACK_SKILL', payload: 1 });
    expect(newState.selectedSkills).toEqual(TEST_SKILLS.体術.slice(0, 2));
  });
  
  it('無効なインデックスでスタックスキルを選択しようとしても無視される', () => {
    const initialState: SkillStackState = { selectedSkills: [TEST_SKILLS.体術[0], TEST_SKILLS.体術[1]] };
    const newState1 = skillStackReducer(initialState, { type: 'SELECT_STACK_SKILL', payload: -1 });
    const newState2 = skillStackReducer(initialState, { type: 'SELECT_STACK_SKILL', payload: 2 });
    expect(newState1).toBe(initialState);
    expect(newState2).toBe(initialState);
  });
  
  it('複数のアクションを連続して実行した場合も正しく処理される', () => {
    // 初期状態
    let state: SkillStackState = { selectedSkills: [] };
    
    // アクション1: スキル追加
    state = skillStackReducer(state, { type: 'ADD_SKILL', payload: TEST_SKILLS.体術[0] });
    expect(state.selectedSkills).toEqual([TEST_SKILLS.体術[0]]);
    
    // アクション2: 別のスキル追加
    state = skillStackReducer(state, { type: 'ADD_SKILL', payload: TEST_SKILLS.体術[1] });
    expect(state.selectedSkills).toEqual([TEST_SKILLS.体術[0], TEST_SKILLS.体術[1]]);
    
    // アクション3: スキル削除
    state = skillStackReducer(state, { type: 'REMOVE_SKILL', payload: TEST_SKILLS.体術[0] });
    expect(state.selectedSkills).toEqual([TEST_SKILLS.体術[1]]);
    
    // アクション4: 同じスキルを再度追加
    state = skillStackReducer(state, { type: 'ADD_SKILL', payload: TEST_SKILLS.体術[1] });
    expect(state.selectedSkills).toEqual([TEST_SKILLS.体術[1], TEST_SKILLS.体術[1]]);
    
    // アクション5: スキルをクリア
    state = skillStackReducer(state, { type: 'CLEAR_SKILLS' });
    expect(state.selectedSkills).toEqual([]);
  });
});

describe('useSkillStack Hook', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SkillStackProvider>{children}</SkillStackProvider>
  );

  it('初期状態が空のスキル配列である', () => {
    const { result } = renderHook(() => useSkillStack(), { wrapper });
    expect(result.current.state.selectedSkills).toEqual([]);
  });

  it('スキルを追加・削除・クリアできる', () => {
    const { result } = renderHook(() => useSkillStack(), { wrapper });
    
    // スキル追加
    act(() => {
      result.current.dispatch({ type: 'ADD_SKILL', payload: TEST_SKILLS.体術[0] });
    });
    expect(result.current.state.selectedSkills).toContain(TEST_SKILLS.体術[0]);
    
    // 別のスキル追加
    act(() => {
      result.current.dispatch({ type: 'ADD_SKILL', payload: TEST_SKILLS.体術[1] });
    });
    expect(result.current.state.selectedSkills).toEqual([TEST_SKILLS.体術[0], TEST_SKILLS.体術[1]]);
    
    // スキル削除
    act(() => {
      result.current.dispatch({ type: 'REMOVE_SKILL', payload: TEST_SKILLS.体術[0] });
    });
    expect(result.current.state.selectedSkills).toEqual([TEST_SKILLS.体術[1]]);
    
    // スタッククリア
    act(() => {
      result.current.dispatch({ type: 'CLEAR_SKILLS' });
    });
    expect(result.current.state.selectedSkills).toEqual([]);
  });
  
  it('最大数の制限が適用される', () => {
    const { result } = renderHook(() => useSkillStack(), { wrapper });
    
    // 最大数を超えるスキル追加
    TEST_SKILLS.体術.slice(0, TEST_SKILLS.MAX_LENGTH + 1).forEach(skill => {
      act(() => {
        result.current.dispatch({ type: 'ADD_SKILL', payload: skill });
      });
    });
    
    // 最初のスキルは削除され、残りの最新4つが残る
    expect(result.current.state.selectedSkills).toEqual(TEST_SKILLS.体術.slice(1, TEST_SKILLS.MAX_LENGTH + 1));
    expect(result.current.state.selectedSkills.length).toBe(TEST_SKILLS.MAX_LENGTH);
  });
});
