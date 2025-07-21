export const AvailableTools = {
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

export type Points = {
    x: number;
    y: number;
    pressure?: number;
};

export type Shape =
    | {
          id: string;
          type: 'selection';
          x: number;
          y: number;
          width: number;
          height: number;
          strokeColor?: string;
          fillColor?: string;
          userId?: string;
          timestamp?: Date;
      }
    | {
          id: string;
          type: 'rectangle';
          x: number;
          y: number;
          width: number;
          height: number;
          radius: number; //edges
          strokeColor: string; // bordercolor
          bgColor: string; // bg color
          strokeWidth: number; //border width
          strokeStyle: number; // border dash
          userId?: string;
          timestamp?: Date;
      }
    | {
          id: string;
          type: 'ellipse';
          x: number;
          y: number;
          radiusX: number;
          radiusY: number;
          rotation?: number;
          startAngle?: number;
          endAngle?: number;
          strokeColor: string;
          bgColor: string;
          strokeWidth: number;
          strokeStyle: number;
          userId?: string;
          timestamp?: Date;
      }
    | {
          id: string;
          type: 'line';
          x: number;
          y: number;
          dx: number;
          dy: number;
          strokeColor: string;
          strokeWidth: number;
          strokeStyle: number;
          userId?: string;
          timestamp?: Date;
      }
    | {
          id: string;
          type: 'pen';
          points: Points[];
          strokeColor?: string;
          fillColor?: 'transparent';
          userId?: string;
          timestamp?: Date;
      }
    | {
          id: string;
          type: 'arrow';
          x: number;
          y: number;
          dx: number;
          dy: number;
          strokeColor: string;
          strokeWidth: number;
          strokeStyle: number;
          userId?: string;
          timestamp?: Date;
      }
    | {
          id: string;
          type: 'diamond';
          x: number;
          y: number;
          width: number;
          height: number;

          strokeColor: string;
          bgColor: string;
          strokeWidth: number;
          strokeStyle: number;

          userId?: string;
          timestamp?: Date;
      }
    | {
          id: string;
          type: 'text';
          text: string;
          fontSize?: string;
          color?: string;
          x: number;
          y: number;
          userId?: string;
          timestamp?: Date;
      };
