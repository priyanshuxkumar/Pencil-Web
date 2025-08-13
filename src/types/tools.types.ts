export const AvailableTools = {
    AI: 'ai',
    Hand: 'hand',
    Selection: 'selection',
    Rectangle: 'rectangle',
    Ellipse: 'ellipse',
    Arrow: 'arrow',
    Line: 'line',
    Text: 'text',
    Diamond: 'diamond',
    Pen: 'pen',
    Image: 'image',
} as const;

export type AvailableTools = (typeof AvailableTools)[keyof typeof AvailableTools];
