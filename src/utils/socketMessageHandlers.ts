import type { RoomUser } from '../components/Canvas';
import type { Shape } from '../types/shapes.types';
import type { ServerSocketEvent } from '../types/socket.types';
import { setLocalStorage } from './localStorage';

type SocketHandlerContext = {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    resizedShapeRef: React.RefObject<Shape | null>;
    sessionRef: React.RefObject<'active' | 'not-active'>;
    shapes: Shape[];
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
    selectedShape: Shape | null;
    setSelectedShape: React.Dispatch<React.SetStateAction<Shape | null>>;
    setRoomUsers: React.Dispatch<React.SetStateAction<RoomUser[]>>;
    setCursorPosition: React.Dispatch<
        React.SetStateAction<
            Record<
                string,
                {
                    roomId: string;
                    username: string;
                    userId: string;
                    x: number;
                    y: number;
                }
            >
        >
    >;
    panOffset: { x: number; y: number };
    navigate: (path: string) => void;
    drawShape: (ctx: CanvasRenderingContext2D, shape: Shape) => void;
};

export function handleSocketMessage(message: ServerSocketEvent | null, ctxObj: SocketHandlerContext) {
    if (!message) return;

    const {
        canvas,
        ctx,
        panOffset,
        shapes,
        selectedShape,
        setShapes,
        setSelectedShape,
        setRoomUsers,
        setCursorPosition,
        resizedShapeRef,
        navigate,
        drawShape,
    } = ctxObj;

    switch (message.type) {
        case 'error': {
            navigate('/');
            break;
        }

        case 'user-room-joined': {
            const user = message.data;
            setRoomUsers((prev) => [user, ...prev]);
            break;
        }

        case 'room-joined': {
            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            message.data.shapes?.forEach((shape: Shape) => drawShape(ctx, shape));
            ctx.restore();

            setShapes((prev) => [...prev, ...message.data.shapes]);
            setRoomUsers([...message.data.existingUsers]);

            setLocalStorage('user_name', message.data.name);
            setLocalStorage('user_id', message.data.userId);
            break;
        }

        case 'shape-created': {
            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            drawShape(ctx, message.data?.shape as Shape);
            ctx.restore();
            setShapes((prev) => [...prev, message.data.shape]);
            break;
        }

        case 'shape-removed': {
            const { shapeId } = message.data;
            const updatedShapes = shapes.filter((shape) => shape.id !== shapeId);

            updatedShapes.forEach((shape) => {
                ctx.save();
                ctx.translate(panOffset.x, panOffset.y);
                drawShape(ctx, shape);
                ctx.restore();
            });

            setShapes(updatedShapes);
            break;
        }

        case 'cursor-position': {
            const { roomId, id, name, x, y } = message.data;
            const position = {
                roomId,
                userId: id,
                username: name,
                x,
                y,
            };

            setTimeout(() => {
                setCursorPosition((prev) => ({
                    ...prev,
                    [position.userId]: position,
                }));
            }, 10);

            break;
        }

        case 'selected-shape': {
            const _shape: Shape | undefined = shapes.find((s: Shape) => s.id === message.data.shapeId);
            if (!_shape) return;
            setSelectedShape(_shape);
            break;
        }

        case 'resized-shape': {
            const updatedShape = message.data.updatedShape;

            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

            ctx.save();
            ctx.translate(panOffset.x, panOffset.y);
            shapes.forEach((shape) => drawShape(ctx, updatedShape.id === selectedShape?.id ? updatedShape : shape));
            ctx.restore();

            resizedShapeRef.current = updatedShape;

            setShapes((prev) => prev.map((shape) => (shape.id === updatedShape.id ? updatedShape : shape)));
            break;
        }

        case 'canvas-cleared': {
            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
            setShapes([]);
            setSelectedShape(null);
            break;
        }

        case 'user-exit': {
            const leavedUserId = message.data.userId;

            setRoomUsers((prev) => prev.filter((item) => item.id !== leavedUserId));

            setCursorPosition((prev) => {
                const updated = { ...prev };
                delete updated[leavedUserId];
                return updated;
            });
            break;
        }
        default: {
            break;
        }
    }
}
