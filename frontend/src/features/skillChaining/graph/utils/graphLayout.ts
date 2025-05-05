export interface CircleLayoutOptions {
  centerX?: number;
  centerY?: number;
  minRadius?: number;
  baseRadius?: number;
  increment?: number;
}

/**
 * 円形レイアウトを計算するユーティリティ関数
 * 
 * @param items 配置する要素の配列
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
  const angle = (index * 2 * Math.PI) / total;
  const radius = Math.max(minRadius, baseRadius + total * increment);
  
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}
