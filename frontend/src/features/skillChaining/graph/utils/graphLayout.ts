import { CircleLayoutOptions } from '@features/skillChaining/types';

/**
 * 円形レイアウトを計算するユーティリティ関数
 * 配列の順序を保持するように設計
 * 
 * @param items 配置する要素の配列（カテゴリ順にソート済み）
 * @param index 現在の要素のインデックス
 * @param options レイアウトオプション
 * @returns {x, y} 座標
 */
export function calculateCircleLayout<T>(
  items: T[],
  index: number,
  options: CircleLayoutOptions = {}
): { x: number; y: number } {
  const {
    centerX = 250,
    centerY = 250,
    minRadius = 200,
    baseRadius = 150,
    increment = 5,
  } = options;
  
  const total = items.length;
  
  // 0時方向（上）から時計回りに配置
  // 最初の要素（インデックス0）を12時の位置（角度 = -π/2）に配置
  const startAngle = -Math.PI / 2;
  const angle = startAngle + (index * 2 * Math.PI) / total;
  
  const radius = Math.max(minRadius, baseRadius + total * increment);
  
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}
