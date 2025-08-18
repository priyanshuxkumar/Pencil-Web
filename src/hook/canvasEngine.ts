import type React from 'react';
import { useCanvas } from '../hook/useCanvas';
import { useTools } from '../hook/useTools';
import { getBoundingBox, handleShapeResize, normalizeRect, resetCanvas } from '../utils/canvas';
import { EDGES, STROKE_COLORS, STROKE_STYLES, STROKE_WIDTHS, BACKGROUND_COLORS } from '../constant/canvas';
import { useEffect, useMemo } from 'react';
import { drawPen } from '../_shapes/freehand';
import { drawSelection } from '../_shapes/shapes';
import { throttle } from '../utils/throttle';
import { useSocket } from '../hook/useSocket';
import { AvailableTools } from '../types/tools.types';
import type { Shape } from '../types/shapes.types';
import {
    createArrowAndLine,
    createDiamond,
    createEllipse,
    createRectangle,
    createTextShape,
} from '../utils/canvas.shapes';

interface CanvasEngineProp {
    resizeRef: React.RefObject<Shape | null>;
    resizedShapeRef: React.RefObject<Shape | null>;
    sendCursorPosition: (x: number, y: number) => void;
    roomId: string;
}

export const useCanvasEngine = ({ resizeRef, resizedShapeRef, sendCursorPosition, roomId }: CanvasEngineProp) => {
    const { socketRef, sendMessage } = useSocket();
    const {
        canvasRef,
        drawShape,
        shapes,
        setShapes,
        setSelectedShape,
        scale,
        start,
        selectedShape,
        setCursor,
        panOffset,
        setIsPanning,
        setStartPan,
        isDrawing,
        selectedBorderBounds,
        resizeDirection,
        setResizeDirection,
        isResizing,
        setIsResizing,
        isPanning,
        startPan,
        setPanOffset,
    } = useCanvas();

    const {
        selectedTool,
        setSelectedTool,
        selectedStrokeColor,
        selectedBackgroundColor,
        selectedStrokeWidth,
        selectedStrokeStyle,
        selectedEdges,
        currentPoints,
        selectionRect,
        setSelectionRect,
        selectedTextSize,
    } = useTools();

    const throttledSendCursorPosition = useMemo(() => throttle(sendCursorPosition, 300), [sendCursorPosition]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvasRef.current?.getContext('2d');

        // select the shape
        const handleSelectShape = (clientX: number, clientY: number) => {
            if (!canvas || !ctx || selectedTool !== 'selection') return;
            const rect = canvas?.getBoundingClientRect();

            const current = {
                x: (clientX - rect.left) / scale - panOffset.x,
                y: (clientY - rect.top) / scale - panOffset.y,
            };

            if (selectedBorderBounds) {
                const { x, y, width, height } = selectedBorderBounds;
                const handleSize = 10;
                const near = (a: number, b: number) => Math.abs(a - b) <= handleSize;
                const nearTopLeft = near(current.x, x) && near(current.y, y);
                const nearTopRight = near(current.x, x + width) && near(current.y, y);
                const nearBottomLeft = near(current.x, x) && near(current.y, y + height);
                const nearBottomRight = near(current.x, x + width) && near(current.y, y + height);

                // track user clicked on which side of shape
                if (nearTopLeft || nearBottomLeft || nearBottomRight || nearTopRight) {
                    if (nearTopLeft) {
                        setResizeDirection('top-left');
                    } else if (nearBottomLeft) {
                        setResizeDirection('bottom-left');
                    } else if (nearTopRight) {
                        setResizeDirection('top-right');
                    } else if (nearBottomRight) {
                        setResizeDirection('bottom-right');
                    }
                    setIsResizing(true);
                    return;
                }
            }

            // find the shapes based on cordiantes. user is selecting
            const _shape = shapes.find((shape: Shape) => {
                if (shape.type === AvailableTools.Pen) return false;

                const { x, y, width, height } = getBoundingBox(shape);

                const left = width >= 0 ? x : x + width;
                const top = height >= 0 ? y : y + height;
                const right = width >= 0 ? x + width : x;
                const bottom = height >= 0 ? y + height : y;

                const withinX = current.x >= left && current.x <= right;
                const withinY = current.y >= top && current.y <= bottom;
                return withinX && withinY;
            });

            setSelectedShape(_shape || null);

            if (socketRef.current && selectedShape && _shape) {
                sendMessage({
                    type: 'select-shape',
                    payload: {
                        roomId,
                        shapeId: _shape?.id,
                    },
                });
            }
            setIsResizing(false);
        };

        // Track cursor position of the user
        const handleCursorPosition = (e: MouseEvent) => {
            if (!canvas || !ctx || !socketRef.current) return;
            const rect = canvas.getBoundingClientRect();

            // Get the current postions (adjusted for pan offset)
            const currX = (e.clientX - rect.left) / scale - panOffset.x;
            const currY = (e.clientY - rect.top) / scale - panOffset.y;

            // throttled cursor fn
            throttledSendCursorPosition(currX, currY);
        };

        // when user start click on canvas
        const handleMouseDown = (e: MouseEvent) => {
            if (!canvas || !ctx) return;

            // select shape (if any of clicked points)
            handleSelectShape(e.clientX, e.clientY);

            const rect = canvas?.getBoundingClientRect();

            start.current = {
                x: (e.clientX - rect.left) / scale - panOffset.x,
                y: (e.clientY - rect.top) / scale - panOffset.y,
            };

            if (selectedShape) {
                resizeRef.current = { ...(selectedShape as Shape) };
            }

            // check user is panning
            if (selectedTool === AvailableTools.Hand) {
                if (!ctx) return;
                setCursor('grab');
                setIsPanning(true);

                setStartPan({ x: e.clientX, y: e.clientY });
                return;
            }

            if (selectedTool === AvailableTools.Pen) {
                currentPoints.current = [{ x: start.current.x, y: start.current.y, pressure: 0.5 }];
            }

            isDrawing.current = true;
        };

        // when user start moving cursor on canvas
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvas || !ctx) return;

            // Get the current postions (adjusted for pan offset)
            const rect = canvas.getBoundingClientRect();
            const currX = (e.clientX - rect.left) / scale - panOffset.x;
            const currY = (e.clientY - rect.top) / scale - panOffset.y;

            // panning
            if (selectedTool === AvailableTools.Hand && isPanning) {
                setCursor('grabbing');
                const deltaX = e.clientX - startPan.x;
                const deltaY = e.clientY - startPan.y;
                setPanOffset({
                    x: panOffset.x + deltaX / scale,
                    y: panOffset.y + deltaY / scale,
                });
                setStartPan({ x: e.clientX, y: e.clientY });
                return;
            }

            const deltaX = currX - start.current.x;
            const deltaY = currY - start.current.y;
            const hasMoved = Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1;

            // Resizing
            if (isResizing && selectedShape && resizeDirection && hasMoved) {
                const updatedShape = handleShapeResize(
                    getBoundingBox(resizeRef.current as Shape),
                    resizeRef.current as Shape,
                    currX,
                    currY,
                    resizeDirection,
                );
                Object.assign(selectedShape, updatedShape);

                const dpr = window.devicePixelRatio || 1;
                ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
                ctx.clearRect(0, 0, canvas.width / (dpr * scale), canvas.height / (dpr * scale));

                ctx.save();
                ctx.translate(panOffset.x, panOffset.y);
                shapes.forEach((shape) => drawShape(ctx, shape.id === selectedShape.id ? selectedShape : shape));
                ctx.restore();

                // save the updated shape for update the shapes state
                resizedShapeRef.current = updatedShape;

                // send to socket
                if (socketRef.current) {
                    sendMessage({
                        type: 'resize-shape',
                        payload: {
                            roomId,
                            shape: updatedShape,
                        },
                    });
                }
                return;
            }

            if (!isDrawing.current) return;

            const { x, y, width, height } = normalizeRect(start.current.x, start.current.y, currX, currY);
            resetCanvas(ctx, canvas, scale);

            // Draw existing shapes with pan offset first
            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            shapes.forEach((shape) => drawShape(ctx, shape));
            ctx.restore();

            // common style values
            const strokeColor = STROKE_COLORS[selectedStrokeColor];
            const strokeWidth = STROKE_WIDTHS[selectedStrokeWidth];
            const strokeStyle = STROKE_STYLES[selectedStrokeStyle];
            const bgColor = BACKGROUND_COLORS[selectedBackgroundColor];
            const radius = EDGES[selectedEdges];

            // Draw preview shapes without pan offset (coordinates are already adjusted)
            switch (selectedTool) {
                case AvailableTools.Selection: {
                    ctx.save();
                    ctx.translate(panOffset.x, panOffset.y);
                    const { x, y, width, height } = normalizeRect(start.current.x, start.current.y, currX, currY);
                    setSelectionRect({ x, y, width, height });
                    ctx.restore();
                    break;
                }
                case AvailableTools.Rectangle: {
                    ctx.save();
                    ctx.translate(panOffset.x, panOffset.y);
                    drawShape(ctx, {
                        id: 'preview',
                        type: AvailableTools.Rectangle,
                        x,
                        y,
                        width,
                        height,
                        radius,
                        strokeColor,
                        bgColor,
                        strokeWidth,
                        strokeStyle,
                    });
                    ctx.restore();
                    break;
                }
                case AvailableTools.Ellipse: {
                    ctx.save();
                    ctx.translate(panOffset.x, panOffset.y);
                    const radiusX = width / 2;
                    const radiusY = height / 2;
                    drawShape(ctx, {
                        id: 'preview',
                        type: AvailableTools.Ellipse,
                        x,
                        y,
                        radiusX,
                        radiusY,
                        strokeColor,
                        bgColor,
                        strokeWidth,
                        strokeStyle,
                    });
                    ctx.restore();
                    break;
                }
                case AvailableTools.Pen: {
                    // Add current point to the stroke
                    currentPoints.current.push({ x: currX, y: currY, pressure: 0.5 });

                    // Draw current pen stroke (coordinates are already adjusted)
                    const previewPenShape: Shape = {
                        id: 'preview',
                        type: AvailableTools.Pen,
                        points: [...currentPoints.current],
                    };

                    ctx.fillStyle = '#000';
                    ctx.save();
                    ctx.translate(panOffset.x, panOffset.y);
                    drawPen(ctx, previewPenShape);
                    ctx.restore();

                    break;
                }

                case AvailableTools.Line: {
                    const startX = start.current.x;
                    const startY = start.current.y;
                    const endX = currX;
                    const endY = currY;
                    const dx = endX - startX;
                    const dy = endY - startY;

                    ctx.save();
                    ctx.translate(panOffset.x, panOffset.y);
                    drawShape(ctx, {
                        id: 'preview',
                        type: AvailableTools.Line,
                        x: startX,
                        y: startY,
                        dx: dx,
                        dy: dy,
                        strokeColor,
                        strokeWidth,
                        strokeStyle,
                    });
                    ctx.restore();
                    break;
                }

                case AvailableTools.Arrow: {
                    const startX = start.current.x;
                    const startY = start.current.y;
                    const endX = currX;
                    const endY = currY;
                    const dx = endX - startX;
                    const dy = endY - startY;

                    ctx.save();
                    ctx.translate(panOffset.x, panOffset.y);
                    drawShape(ctx, {
                        id: 'preview',
                        type: AvailableTools.Arrow,
                        x: startX,
                        y: startY,
                        dx,
                        dy,
                        strokeColor,
                        strokeWidth,
                        strokeStyle,
                    });
                    ctx.restore();
                    break;
                }

                case AvailableTools.Diamond: {
                    ctx.save();
                    ctx.translate(panOffset.x, panOffset.y);
                    drawShape(ctx, {
                        id: 'preview',
                        type: AvailableTools.Diamond,
                        x,
                        y,
                        width,
                        height,
                        strokeColor,
                        bgColor,
                        strokeWidth,
                        strokeStyle,
                    });
                    ctx.restore();
                    break;
                }
            }

            // Selection rectangle render
            if (selectionRect) {
                ctx.save();
                ctx.translate(panOffset.x, panOffset.y);
                drawSelection(ctx, selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
                ctx.restore();
            }
            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            ctx.restore();
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!canvas || !ctx) return;

            // stop panning
            if (isPanning) {
                setIsPanning(false);
                setCursor('grab');
                return;
            }

            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            shapes.forEach((shape) => drawShape(ctx, shape));
            ctx.restore();

            setIsResizing(false);
            setResizeDirection(null);

            if (!isDrawing.current) return;
            isDrawing.current = false;

            // switch back to selection tool
            if (
                selectedTool !== AvailableTools.Pen &&
                selectedTool !== AvailableTools.Text &&
                selectedTool !== AvailableTools.Hand
            ) {
                setSelectedTool(AvailableTools.Selection);
                setCursor('default');
            }

            const rect = canvas.getBoundingClientRect();
            const endX = (e.clientX - rect.left) / scale - panOffset.x;
            const endY = (e.clientY - rect.top) / scale - panOffset.y;

            // skip if no movement
            if (start.current.x === endX || start.current.y === endY) return;

            const { x, y, width, height } = normalizeRect(start.current.x, start.current.y, endX, endY);

            // create shapes
            let shape: Shape | null = null;

            const strokeColor = STROKE_COLORS[selectedStrokeColor];
            const strokeWidth = STROKE_WIDTHS[selectedStrokeWidth];
            const strokeStyle = STROKE_STYLES[selectedStrokeStyle];
            const bgColor = BACKGROUND_COLORS[selectedBackgroundColor];
            const radius = EDGES[selectedEdges];

            switch (selectedTool) {
                case AvailableTools.Selection:
                    isDrawing.current = false;
                    setSelectionRect(null);
                    break;

                case AvailableTools.Rectangle: {
                    shape = createRectangle(
                        x,
                        y,
                        width,
                        height,
                        strokeColor,
                        bgColor,
                        strokeWidth,
                        strokeStyle,
                        radius,
                    );
                    break;
                }

                case AvailableTools.Ellipse: {
                    shape = createEllipse(x, y, width, height, strokeColor, bgColor, strokeWidth, strokeStyle);
                    break;
                }

                case AvailableTools.Diamond: {
                    shape = createDiamond(x, y, width, height, strokeColor, bgColor, strokeWidth, strokeStyle);
                    break;
                }

                case AvailableTools.Arrow: {
                    shape = createArrowAndLine(
                        AvailableTools.Arrow,
                        start.current.x,
                        start.current.y,
                        endX,
                        endY,
                        strokeColor,
                        strokeWidth,
                        strokeStyle,
                    );
                    break;
                }

                case AvailableTools.Line: {
                    shape = createArrowAndLine(
                        AvailableTools.Line,
                        start.current.x,
                        start.current.y,
                        endX,
                        endY,
                        strokeColor,
                        strokeWidth,
                        strokeStyle,
                    );
                    break;
                }

                case AvailableTools.Pen: {
                    shape = {
                        id: Date.now().toString(),
                        type: AvailableTools.Pen,
                        points: [...currentPoints.current],
                    };
                    break;
                }

                default:
                    break;
            }
            if (shape) {
                setShapes((prev) => [...prev, shape]);
                setSelectedShape(shape);

                // send shape to ws server
                if (socketRef.current) {
                    sendMessage({
                        type: 'create-shape',
                        payload: {
                            roomId,
                            shape: shape,
                        },
                    });
                }
            }
            isDrawing.current = false;
        };

        const handleWriteText = (e: MouseEvent) => {
            if (!canvas || !ctx) return;

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / scale - panOffset.x;
            const y = (e.clientY - rect.top) / scale - panOffset.y;

            const fontSize = selectedTextSize === 'S' ? '12px' : selectedTextSize === 'M' ? '20px' : '30px';
            const color = STROKE_COLORS[selectedStrokeColor] ?? '#000';

            const input = document.createElement('textarea');
            input.style.position = 'absolute';
            input.style.left = `${e.clientX}px`;
            input.style.top = `${e.clientY}px`;
            input.style.fontSize = fontSize;
            input.style.border = 'none';
            input.style.outline = 'none';
            input.style.overflow = 'hidden';
            input.style.resize = 'none';
            input.style.background = 'transparent';
            input.style.padding = '0px';
            input.style.margin = '0px';
            input.style.color = color;
            input.style.fontFamily = '"Playpen Sans", cursive, Arial, sans-serif';
            input.style.minWidth = '20px';
            input.style.width = '100%';
            input.style.height = 'auto';
            input.style.whiteSpace = 'pre';
            input.style.lineHeight = '1.2';

            document.body.appendChild(input);
            input.focus();

            const onBlur = () => {
                document.body.removeChild(input);

                if (!input.value.trim()) {
                    setSelectedTool(AvailableTools.Selection);
                    return;
                }

                const shape = createTextShape(x, y, input.value, fontSize, color);

                drawShape(ctx, shape);

                if (socketRef.current) {
                    sendMessage({
                        type: 'create-shape',
                        payload: {
                            roomId,
                            shape: shape,
                        },
                    });
                }
                setShapes((prev) => [...prev, shape]);
                setSelectedTool(AvailableTools.Selection);
            };

            input.addEventListener('blur', onBlur, { once: true });
        };

        canvas?.addEventListener('mousedown', handleMouseDown);
        canvas?.addEventListener('mousemove', handleMouseMove);
        canvas?.addEventListener('mouseup', handleMouseUp);
        canvas?.addEventListener('dblclick', handleWriteText);
        canvas?.addEventListener('mousemove', handleCursorPosition);

        return () => {
            canvas?.removeEventListener('mousedown', handleMouseDown);
            canvas?.removeEventListener('mousemove', handleMouseMove);
            canvas?.removeEventListener('mouseup', handleMouseUp);
            canvas?.removeEventListener('dblclick', handleWriteText);
            canvas?.removeEventListener('mousemove', handleCursorPosition);
        };
    }, [
        canvasRef,
        currentPoints,
        drawShape,
        isDrawing,
        isPanning,
        isResizing,
        panOffset.x,
        panOffset.y,
        resizeDirection,
        resizeRef,
        resizedShapeRef,
        roomId,
        scale,
        selectedBackgroundColor,
        selectedBorderBounds,
        selectedEdges,
        selectedShape,
        selectedStrokeColor,
        selectedStrokeStyle,
        selectedStrokeWidth,
        selectedTextSize,
        selectedTool,
        selectionRect,
        sendMessage,
        setCursor,
        setIsPanning,
        setIsResizing,
        setPanOffset,
        setResizeDirection,
        setSelectedShape,
        setSelectedTool,
        setSelectionRect,
        setShapes,
        setStartPan,
        shapes,
        socketRef,
        start,
        startPan.x,
        startPan.y,
        throttledSendCursorPosition,
    ]);
};
