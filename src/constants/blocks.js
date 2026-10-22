// Block definitions with matrices and vibrant neon/gem colors
export const BLOCK_PALETTE = {
  cyan: {
    base: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.6)',
    gradient: 'linear-gradient(135deg, #22d3ee, #0891b2)',
    border: '#67e8f9'
  },
  purple: {
    base: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.6)',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    border: '#c4b5fd'
  },
  pink: {
    base: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.6)',
    gradient: 'linear-gradient(135deg, #f472b6, #db2777)',
    border: '#fbcfe8'
  },
  amber: {
    base: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.6)',
    gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    border: '#fde68a'
  },
  emerald: {
    base: '#10b981',
    glow: 'rgba(16, 185, 129, 0.6)',
    gradient: 'linear-gradient(135deg, #34d399, #059669)',
    border: '#a7f3d0'
  },
  rose: {
    base: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.6)',
    gradient: 'linear-gradient(135deg, #fb7185, #e11d48)',
    border: '#fecdd3'
  },
  blue: {
    base: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.6)',
    gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    border: '#bfdbfe'
  },
  orange: {
    base: '#f97316',
    glow: 'rgba(249, 115, 22, 0.6)',
    gradient: 'linear-gradient(135deg, #fb923c, #ea580c)',
    border: '#fed7aa'
  }
};

export const BLOCK_SHAPES = [
  // 1x1 Single
  {
    id: 'dot-1',
    name: 'Single Dot',
    matrix: [[1]],
    colorKey: 'amber',
    tier: 'small'
  },

  // 1x2 and 2x1
  {
    id: 'h-2',
    name: 'Horizontal 2',
    matrix: [[1, 1]],
    colorKey: 'cyan',
    tier: 'small'
  },
  {
    id: 'v-2',
    name: 'Vertical 2',
    matrix: [[1], [1]],
    colorKey: 'cyan',
    tier: 'small'
  },

  // 1x3 and 3x1
  {
    id: 'h-3',
    name: 'Horizontal 3',
    matrix: [[1, 1, 1]],
    colorKey: 'blue',
    tier: 'small'
  },
  {
    id: 'v-3',
    name: 'Vertical 3',
    matrix: [[1], [1], [1]],
    colorKey: 'blue',
    tier: 'small'
  },

  // 1x4 and 4x1
  {
    id: 'h-4',
    name: 'Horizontal 4',
    matrix: [[1, 1, 1, 1]],
    colorKey: 'purple',
    tier: 'medium'
  },
  {
    id: 'v-4',
    name: 'Vertical 4',
    matrix: [[1], [1], [1], [1]],
    colorKey: 'purple',
    tier: 'medium'
  },

  // 1x5 and 5x1
  {
    id: 'h-5',
    name: 'Horizontal 5',
    matrix: [[1, 1, 1, 1, 1]],
    colorKey: 'emerald',
    tier: 'large'
  },
  {
    id: 'v-5',
    name: 'Vertical 5',
    matrix: [[1], [1], [1], [1], [1]],
    colorKey: 'emerald',
    tier: 'large'
  },

  // 2x2 Square
  {
    id: 'sq-2',
    name: 'Square 2x2',
    matrix: [
      [1, 1],
      [1, 1]
    ],
    colorKey: 'pink',
    tier: 'small'
  },

  // 3x3 Square
  {
    id: 'sq-3',
    name: 'Square 3x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    colorKey: 'rose',
    tier: 'large'
  },

  // Small Corner 2x2 (3 blocks)
  {
    id: 'c2-tl',
    name: 'Corner 2x2 TL',
    matrix: [
      [1, 1],
      [1, 0]
    ],
    colorKey: 'orange',
    tier: 'small'
  },
  {
    id: 'c2-tr',
    name: 'Corner 2x2 TR',
    matrix: [
      [1, 1],
      [0, 1]
    ],
    colorKey: 'orange',
    tier: 'small'
  },
  {
    id: 'c2-bl',
    name: 'Corner 2x2 BL',
    matrix: [
      [1, 0],
      [1, 1]
    ],
    colorKey: 'orange',
    tier: 'small'
  },
  {
    id: 'c2-br',
    name: 'Corner 2x2 BR',
    matrix: [
      [0, 1],
      [1, 1]
    ],
    colorKey: 'orange',
    tier: 'small'
  },

  // Big Corner 3x3 (5 blocks)
  {
    id: 'c3-tl',
    name: 'Corner 3x3 TL',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0]
    ],
    colorKey: 'amber',
    tier: 'large'
  },
  {
    id: 'c3-tr',
    name: 'Corner 3x3 TR',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1]
    ],
    colorKey: 'amber',
    tier: 'large'
  },
  {
    id: 'c3-bl',
    name: 'Corner 3x3 BL',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    colorKey: 'amber',
    tier: 'large'
  },
  {
    id: 'c3-br',
    name: 'Corner 3x3 BR',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1]
    ],
    colorKey: 'amber',
    tier: 'large'
  },

  // Standard L-shape (3x2 and 2x3)
  {
    id: 'l-dl',
    name: 'L Down-Left',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1]
    ],
    colorKey: 'cyan',
    tier: 'medium'
  },
  {
    id: 'l-dr',
    name: 'L Down-Right',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1]
    ],
    colorKey: 'cyan',
    tier: 'medium'
  },
  {
    id: 'l-ul',
    name: 'L Up-Left',
    matrix: [
      [1, 1],
      [1, 0],
      [1, 0]
    ],
    colorKey: 'cyan',
    tier: 'medium'
  },
  {
    id: 'l-ur',
    name: 'L Up-Right',
    matrix: [
      [1, 1],
      [0, 1],
      [0, 1]
    ],
    colorKey: 'cyan',
    tier: 'medium'
  },

  // T-Shapes
  {
    id: 't-up',
    name: 'T Up',
    matrix: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    colorKey: 'purple',
    tier: 'medium'
  },
  {
    id: 't-down',
    name: 'T Down',
    matrix: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    colorKey: 'purple',
    tier: 'medium'
  },
  {
    id: 't-left',
    name: 'T Left',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0]
    ],
    colorKey: 'purple',
    tier: 'medium'
  },
  {
    id: 't-right',
    name: 'T Right',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1]
    ],
    colorKey: 'purple',
    tier: 'medium'
  },

  // S and Z shapes
  {
    id: 'z-shape',
    name: 'Z Shape',
    matrix: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    colorKey: 'rose',
    tier: 'medium'
  },
  {
    id: 's-shape',
    name: 'S Shape',
    matrix: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    colorKey: 'emerald',
    tier: 'medium'
  },

  // Plus / Cross shape
  {
    id: 'plus-5',
    name: 'Plus Shape',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    colorKey: 'cyan',
    tier: 'medium'
  }
];

export const GRID_SIZE = 8;
