const STROKE_WIDTHS = [2, 3, 5];
const STROKE_STYLES = [0, 3];
const EDGES = [0, 30];
const TEXT_SIZE = ['S', 'M', 'L'];

const STROKE_COLORS = [
    '#1a1a1a',
    '#ef4444',
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#84cc16',
    '#6b7280',
];

const BACKGROUND_COLORS = [
    'transparent',
    '#1a1a1a10',
    '#ef444410',
    '#10b98110',
    '#3b82f610',
    '#f59e0b10',
    '#8b5cf610',
    '#06b6d410',
    '#ec489910',
    '#84cc1610',
    '#6b728010',
];

const PRECISION_REGEX = /(\s?[A-Z]?,?-?[0-9]*\.[0-9]{0,2})(([0-9]|e|-)*)/g;

export { STROKE_COLORS, BACKGROUND_COLORS, STROKE_WIDTHS, STROKE_STYLES, EDGES, TEXT_SIZE, PRECISION_REGEX };
