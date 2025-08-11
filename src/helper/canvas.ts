import { AvailableTools, type Shape } from '../types';

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
