import React, { useCallback, useRef, useState } from 'react';
import type { CursorType } from '../components/Canvas';
import type { Shape } from '../types/shapes.types';
import { CanvasContext } from '../hook/useCanvas';
import { drawPen } from '../_shapes/freehand';
import { AvailableTools } from '../types/tools.types';
import { drawArrow, drawDiamond, drawLine, drawSelection, drawText, ellipse, roundedRect } from '../_shapes/shapes';
import { drawSelectionBorder, getBoundingBox } from '../utils/canvas';
import { useSocket } from '../hook/useSocket';

interface CanvasProviderProp {
    children: React.ReactNode;
}

export interface CanvasContextType {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;

    drawShape: (ctx: CanvasRenderingContext2D, shape: Shape) => void;

    start: React.RefObject<{ x: number; y: number }>;
    isDrawing: React.RefObject<boolean>;

    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;

    shapes: Shape[];
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;

    selectedShape: Shape | null;
    setSelectedShape: React.Dispatch<React.SetStateAction<Shape | null>>;

    selectedBorderBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;

    setSelectedBorderBounds: React.Dispatch<
        React.SetStateAction<{ x: number; y: number; width: number; height: number } | null>
    >;

    resizeDirection: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

    setResizeDirection: React.Dispatch<
        React.SetStateAction<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>
    >;

    cursor: CursorType;
    setCursor: React.Dispatch<CursorType>;

    isPanning: boolean;
    setIsPanning: React.Dispatch<boolean>;

    panOffset: { x: number; y: number };
    setPanOffset: React.Dispatch<{ x: number; y: number }>;

    startPan: { x: number; y: number };
    setStartPan: React.Dispatch<{ x: number; y: number }>;

    isResizing: boolean;
    setIsResizing: React.Dispatch<boolean>;

    deleteShape: (shapeId: string) => void;
}

export const CanvasProvider: React.FC<CanvasProviderProp> = ({ children }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const start = useRef({ x: 0, y: 0 });
    const isDrawing = useRef(false);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedBorderBounds, setSelectedBorderBounds] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
    const [resizeDirection, setResizeDirection] = useState<
        'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null
    >(null);

    const [cursor, setCursor] = useState<CursorType>('default');
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);

    const drawShape = useCallback(
        (ctx: CanvasRenderingContext2D, shape: Shape) => {
            switch (shape.type) {
                case AvailableTools.Rectangle:
                    roundedRect(
                        ctx,
                        shape.x,
                        shape.y,
                        shape.width,
                        shape.height,
                        shape.radius,
                        shape.strokeColor,
                        shape.bgColor,
                        shape.strokeWidth,
                        shape.strokeStyle,
                    );
                    break;
                case AvailableTools.Ellipse: {
                    ellipse(
                        ctx,
                        shape.x,
                        shape.y,
                        shape.radiusX,
                        shape.radiusY,
                        shape.strokeColor,
                        shape.bgColor,
                        shape.strokeWidth,
                        shape.strokeStyle,
                    );
                    break;
                }
                case AvailableTools.Diamond:
                    drawDiamond(
                        ctx,
                        shape.x,
                        shape.y,
                        shape.width,
                        shape.height,
                        shape.strokeColor,
                        shape.bgColor,
                        shape.strokeWidth,
                        shape.strokeStyle,
                    );
                    break;
                case AvailableTools.Line: {
                    drawLine(
                        ctx,
                        shape.x,
                        shape.y,
                        shape.dx,
                        shape.dy,
                        shape.strokeColor,
                        shape.strokeWidth,
                        shape.strokeStyle,
                    );
                    break;
                }
                case AvailableTools.Arrow:
                    drawArrow(
                        ctx,
                        shape.x,
                        shape.y,
                        shape.dx,
                        shape.dy,
                        shape.strokeColor,
                        shape.strokeWidth,
                        shape.strokeStyle,
                    );
                    break;
                case AvailableTools.Pen:
                    drawPen(ctx, shape);
                    break;
                case AvailableTools.Selection:
                    drawSelection(ctx, shape.x, shape.y, shape.width, shape.height);
                    break;
                case AvailableTools.Text:
                    drawText(ctx, shape.x, shape.y, shape.text, shape.fontSize, shape.color);
                    break;
                default:
                    break;
            }

            if (selectedShape?.id === shape.id) {
                const { x, y, width, height } = getBoundingBox(shape);
                drawSelectionBorder(ctx, { x, y, width, height }, setSelectedBorderBounds);
            }
        },
        [selectedShape?.id, setSelectedBorderBounds],
    );

    const { sendMessage } = useSocket();

    const deleteShape = (shapeId: string) => {
        const canvas = canvasRef.current;
        const ctx = canvasRef.current?.getContext('2d');
        if (!canvas || !ctx) return;

        const updatedShapes = shapes.filter((shape) => shape.id !== shapeId);

        updatedShapes.forEach((shape) => {
            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            drawShape(ctx, shape);
            ctx.restore();
        });
        setShapes(updatedShapes);

        // send to ws
        sendMessage({
            type: 'remove-shape',
            payload: {
                shapeId,
            },
        });
    };

    const value: CanvasContextType = {
        canvasRef,
        drawShape,
        isDrawing,
        scale,
        setScale,
        start,
        shapes,
        setShapes,
        selectedShape,
        setSelectedShape,
        selectedBorderBounds,
        setSelectedBorderBounds,
        resizeDirection,
        setResizeDirection,
        cursor,
        setCursor,
        isPanning,
        setIsPanning,
        panOffset,
        setPanOffset,
        startPan,
        setStartPan,
        isResizing,
        setIsResizing,
        deleteShape,
    };

    return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};
