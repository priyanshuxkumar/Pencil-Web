import type { Shape } from '../types/shapes.types';
import { AvailableTools } from '../types/tools.types';

export function normalizeRect(x1: number, y1: number, x2: number, y2: number) {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    return { x, width, y, height };
}

// extract the roomKey and roomKey from url
export function getRoomIdAndKey(): { roomId: string; roomKey: string } {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const room = params.get('room');
    const [roomId, roomKey] = room?.split(',') || [];
    return {
        roomId,
        roomKey,
    };
}

export function getBoundingBox(shape: Shape): { x: number; y: number; width: number; height: number } {
    switch (shape.type) {
        case AvailableTools.Rectangle:
        case AvailableTools.Diamond:
            return {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
            };
        case AvailableTools.Ellipse:
            return {
                x: shape.x,
                y: shape.y,
                width: shape.radiusX * 2,
                height: shape.radiusY * 2,
            };
        case AvailableTools.Line:
        case AvailableTools.Arrow: {
            const x = Math.min(shape.x, shape.x + shape.dx);
            const y = Math.min(shape.y, shape.y + shape.dy);
            const width = Math.abs(shape.dx);
            const height = Math.abs(shape.dy);
            return { x, y, width, height };
        }
        default:
            return { x: 0, y: 0, width: 0, height: 0 };
    }
}

// render the selection / adjust border around shape
export function drawSelectionBorder(
    ctx: CanvasRenderingContext2D,
    shape: { x: number; y: number; width: number; height: number },
    setSelectedBorderBounds: (bounds: { x: number; y: number; width: number; height: number }) => void,
) {
    const padding = 4;

    const shapeLeft = shape.width >= 0 ? shape.x : shape.x + shape.width;
    const shapeTop = shape.height >= 0 ? shape.y : shape.y + shape.height;
    const shapeRight = shape.width >= 0 ? shape.x + shape.width : shape.x;
    const shapeBottom = shape.height >= 0 ? shape.y + shape.height : shape.y;

    const x1 = shapeLeft - padding;
    const y1 = shapeTop - padding;
    const x2 = shapeRight + padding;
    const y2 = shapeBottom + padding;

    const normX = Math.min(x1, x2);
    const normY = Math.min(y1, y2);
    const normW = Math.abs(x2 - x1);
    const normH = Math.abs(y2 - y1);

    ctx.save();
    ctx.strokeStyle = '#465C88';
    ctx.lineWidth = 1.2;

    ctx.strokeRect(normX, normY, normW, normH);

    const handleSize = 8;
    const half = handleSize / 2;

    const points = [
        { x: normX, y: normY },
        { x: normX + normW, y: normY },
        { x: normX, y: normY + normH },
        { x: normX + normW, y: normY + normH },
    ];

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#465C88';
    ctx.lineWidth = 1.5;

    for (const p of points) {
        ctx.beginPath();
        ctx.rect(p.x - half, p.y - half, handleSize, handleSize);
        ctx.fill();
        ctx.stroke();
    }

    setSelectedBorderBounds({
        x: Math.abs(normX),
        y: Math.abs(normY),
        width: normW,
        height: normH,
    });

    ctx.restore();
}

export const handleShapeResize = (
    originalBounds: { x: number; y: number; width: number; height: number },
    selectedShape: Shape,
    currX: number,
    currY: number,
    resizeDirection: string,
) => {
    const newBound = { ...originalBounds };
    const newShape = { ...selectedShape } as Shape;

    switch (resizeDirection) {
        case 'top-left':
            newBound.width += newBound.x - currX;
            newBound.height += newBound.y - currY;
            newBound.x = currX;
            newBound.y = currY;
            break;
        case 'bottom-left':
            newBound.width += newBound.x - currX;
            newBound.height = currY - newBound.y;
            newBound.x = currX;
            break;
        case 'bottom-right':
            newBound.width = currX - newBound.x;
            newBound.height = currY - newBound.y;
            break;
        case 'top-right':
            newBound.width = currX - newBound.x;
            newBound.height += newBound.y - currY;
            newBound.y = currY;
            break;
    }

    if (newShape.type === AvailableTools.Rectangle || newShape.type === AvailableTools.Diamond) {
        newShape.x = newBound.x;
        newShape.y = newBound.y;
        newShape.width = newBound.width;
        newShape.height = newBound.height;
    } else if (newShape.type === AvailableTools.Ellipse) {
        const x = Math.min(newBound.x, newBound.x + newBound.width);
        const y = Math.min(newBound.y, newBound.y + newBound.height);
        const w = Math.abs(newBound.width);
        const h = Math.abs(newBound.height);

        newShape.x = x;
        newShape.y = y;
        newShape.radiusX = w / 2;
        newShape.radiusY = h / 2;
    } else if (newShape.type === AvailableTools.Line || newShape.type === AvailableTools.Arrow) {
        const x1 = newBound.x;
        const y1 = newBound.y;
        const x2 = newBound.x + newBound.width;
        const y2 = newBound.y + newBound.height;

        if (resizeDirection === 'top-left') {
            newShape.x = currX;
            newShape.y = currY;
            newShape.dx = x2 - currX;
            newShape.dy = y2 - currY;
        } else if (resizeDirection === 'bottom-right') {
            newShape.x = x1;
            newShape.y = y1;
            newShape.dx = currX - x1;
            newShape.dy = currY - y1;
        } else if (resizeDirection === 'top-right') {
            newShape.x = x1;
            newShape.y = currY;
            newShape.dx = currX - x1;
            newShape.dy = y2 - currY;
        } else if (resizeDirection === 'bottom-left') {
            newShape.x = currX;
            newShape.y = y1;
            newShape.dx = x2 - currX;
            newShape.dy = currY - y1;
        }
    }
    return newShape;
};

export function resetCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scale: number) {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, canvas.width / (dpr * scale), canvas.height / (dpr * scale));
}