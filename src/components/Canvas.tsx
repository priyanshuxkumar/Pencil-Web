import { useCallback, useEffect, useRef, useState } from 'react';
import Toolbar from './Toolbar';
import { drawSelection } from '../_shapes/shapes';
import { getLocalStorage } from '../utils/localStorage';
import ToolActions from './ToolActions';
import LiveColoboration from './LiveColoboration';
import RoomLink from './RoomLink';
import { useNavigate } from 'react-router-dom';
import RoomUsersInfo from './RoomUsers';
import Cursor from './Cursor';
import { applyTransform, clearCanvas, getRoomIdAndKey } from '../utils/canvas';
import { handleSocketMessage } from '../utils/socketMessageHandlers';
import { useCanvas } from '../hook/useCanvas';
import { useTools } from '../hook/useTools';
import { useCanvasEngine } from '../hook/canvasEngine';
import { useSocket } from '../hook/useSocket';
import type { Shape } from '../types/shapes.types';
import { AvailableTools } from '../types/tools.types';
import { Minus, Plus } from 'lucide-react';
import { useZoom } from '../hook/useZoom';

export interface RoomUser {
    id: string;
    name: string;
}

export type CursorType = 'default' | 'grab' | 'grabbing' | 'pointer' | 'text' | 'crosshair';

export const Canvas = () => {
    const navigate = useNavigate();

    const {
        canvasRef,
        drawShape,
        scale,
        setScale,
        shapes,
        setShapes,
        selectedShape,
        setSelectedShape,
        cursor,
        panOffset,
        setPanOffset,
    } = useCanvas();

    const { selectedTool, selectionRect } = useTools();

    const resizeRef = useRef<Shape | null>(null);
    const resizedShapeRef = useRef<Shape | null>(null);

    // room
    const sessionRef = useRef<'active' | 'not-active'>('not-active');
    const roomKeyRef = useRef<string | null>(null);
    const [link, setLink] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<string>('');
    const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

    // modals
    const [isColabModalOpen, setIsColabModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const handleLinkModal = () => setIsLinkModalOpen(!isLinkModalOpen);

    // Start Live Coloboration
    const handleStartSession = (generatedLink: string, generatedRoomId: string) => {
        setLink(generatedLink);
        setRoomId(generatedRoomId);
        setIsColabModalOpen(false);
        setIsLinkModalOpen(true);
    };

    const [cursorPosition, setCursorPosition] = useState<
        Record<string, { roomId: string; username: string; userId: string; x: number; y: number }>
    >({});

    const { message, socketRef, connect, disconnect, isConnected, sendMessage } = useSocket();

    // End live colloboration session
    const handleEndSession = useCallback(() => {
        disconnect();
        socketRef.current = null;
        setIsLinkModalOpen(false);
        setIsColabModalOpen(false);
        sessionRef.current = 'not-active';
        setRoomUsers([]);
        navigate('/');
    }, [disconnect, navigate, socketRef]);

    // Current position of cursor of users in the room
    const sendCursorPosition = useCallback(
        (x: number, y: number) => {
            if (roomUsers.length <= 1 || !roomId) return;

            sendMessage({
                type: 'cursor-position',
                payload: {
                    roomId,
                    x,
                    y,
                },
            });
        },
        [roomId, roomUsers.length, socketRef],
    );

    const { handleCanvasZoom } = useZoom(scale, setScale, panOffset, setPanOffset, canvasRef);

    /**
     * Extract the roomId and roomKey from url (Room already created)
     */
    useEffect(() => {
        const { roomId, roomKey } = getRoomIdAndKey();
        if (!roomId || !roomKey) return;

        if (roomKey?.length < 22) {
            window.alert('Key should be 22 characters. Room sharing off.');
            handleEndSession();
            return;
        }

        setRoomId(roomId);
        roomKeyRef.current = roomKey;
        connect();

        sessionRef.current = 'active';
    }, [connect, navigate, socketRef, roomId, handleEndSession]);

    /**
     * User join a existing room
     */
    useEffect(() => {
        if (!isConnected || !roomId || sessionRef.current == 'not-active') return;
        if (!socketRef.current) return;

        const userId = getLocalStorage('user_id');

        sendMessage({
            type: 'join-room',
            payload: {
                roomId,
                userId: JSON.stringify(userId) ?? '',
            },
        });
    }, [isConnected, roomId]);

    /**
     * handle Socket server events
     */
    useEffect(() => {
        if (!socketRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvasRef.current?.getContext('2d');
        if (!canvas || !ctx) return;

        console.log('Socket message:', message);

        handleSocketMessage(message, {
            canvas,
            ctx,
            resizedShapeRef,
            sessionRef,
            shapes,
            setShapes,
            selectedShape,
            setSelectedShape,
            setRoomUsers,
            setCursorPosition,
            panOffset,
            navigate,
            drawShape,
        });
    }, [message]);

    // Canvas Engine functionlity
    useCanvasEngine({ resizeRef, resizedShapeRef, sendCursorPosition, roomId });

    const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;

        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        return ctx;
    }, []);

    /**
     * Canvas resize
     */
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = setupCanvas(canvas);
        if (!ctx) return;

        applyTransform(ctx, scale);
        clearCanvas(ctx, canvas);

        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        shapes.forEach((shape) => {
            drawShape(ctx, shape);
        });

        if (selectionRect) {
            drawSelection(ctx, selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
        }

        ctx.restore();
    }, [canvasRef, setupCanvas, scale, panOffset.x, panOffset.y, shapes, selectionRect, drawShape]);

    // Canvas resize
    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [shapes, setupCanvas, resizeCanvas]);

    // Initial canvas setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        applyTransform(ctx, scale);
        clearCanvas(ctx, canvas);

        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        shapes.forEach((shape) => {
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#000';
            drawShape(ctx, shape);
        });

        if (selectionRect) {
            drawSelection(ctx, selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
        }
        ctx.restore();
    }, [scale, shapes, selectionRect, panOffset.x, panOffset.y, drawShape, canvasRef]);

    /**
     *
     * @param shapes Shapes sent by server (Generated by AI)
     * Render the shapes generated by AI
     */
    const handleDrawAi = (shapes: Shape[]) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        shapes.forEach((s) => drawShape(ctx, s));
        ctx.restore();
        const tShapes = shapes.map((s) => s);

        setShapes((prev) => [...prev, ...tShapes]);
    };

    // Panning effect of canvas board
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);

        shapes.forEach((s) => drawShape(ctx, s));

        ctx.restore();
    }, [drawShape, panOffset.x, panOffset.y, shapes]);

    // Change the cursor style
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.style.cursor = cursor;
    }, [cursor]);

    // Clear the canvas board completely
    const clearCanvasBoard = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        setShapes([]);
        setSelectedShape(null);

        if (socketRef.current) {
            sendMessage({
                type: 'clear-canvas',
            });
        }
    };

    return (
        <>
            <div className="w-full">
                {/* Toolbar */}
                <div className="absolute top-1/6 left-10 transform -translate-x-1/2 z-10">
                    <Toolbar />
                </div>

                {/* Zoom controls */}
                <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-gray-200/50 p-1 text-black">
                    <button
                        onClick={() => handleCanvasZoom(false)}
                        className="text-4xl font-normal flex h-8 w-8 items-center justify-center rounded-xl"
                    >
                        <Minus size={18} />
                    </button>
                    {/* Reset scale button  */}
                    <button
                        onClick={() => setScale(1)}
                        className="text-center font-mono text-sm font-semibold cursor-pointer"
                    >
                        {(scale * 100).toFixed()}%
                    </button>

                    <button
                        onClick={() => handleCanvasZoom(true)}
                        className="text-2xl font-medium flex h-8 w-8 items-center justify-center rounded-xl"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {/* Clear Canvas */}
                <button
                    onClick={clearCanvasBoard}
                    type="button"
                    className="absolute bottom-5 right-5 text-sm font-medium bg-gray-200/50 rounded-lg px-2 py-1"
                >
                    Clear
                </button>

                {/* Share session and Users in room  */}
                <div className="flex gap-5 absolute top-5 right-10 z-50">
                    {roomUsers.length > 0 && (
                        <div className="z-50">
                            <RoomUsersInfo roomUsers={roomUsers} />
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setIsColabModalOpen(!isColabModalOpen);
                            if (socketRef.current) {
                                setIsLinkModalOpen(true);
                            }
                        }}
                        className="z-50 rounded-lg bg-[#465C88] px-4 py-2 text-sm text-white"
                    >
                        Share
                    </button>
                </div>

                {/* Live collaboration modal */}
                {/* Open only when socket not connected  */}
                {isColabModalOpen && socketRef?.current == null && (
                    <div className="absolute top-0 left-0 w-full h-full z-100">
                        {/* sending shapes array if any shapes already exist on canvas then add those shapes to other users  */}
                        <LiveColoboration onStartSession={handleStartSession} shapes={shapes} />
                    </div>
                )}

                {isLinkModalOpen && socketRef.current !== null && sessionRef.current == 'active' && (
                    <div className="absolute top-0 left-0 w-full h-full z-100">
                        <RoomLink
                            handleEndSession={handleEndSession}
                            handleLinkModal={handleLinkModal}
                            link={link || ''}
                        />
                    </div>
                )}

                {socketRef.current &&
                    roomUsers.length > 1 &&
                    Object.values(cursorPosition).map((cursor) => (
                        <Cursor
                            key={cursor.userId}
                            x={cursor.x}
                            y={cursor.y}
                            username={cursor.username}
                            color="#8b5cf6"
                        />
                    ))}

                {(selectedTool === AvailableTools.AI ||
                    selectedTool === AvailableTools.Rectangle ||
                    selectedTool === AvailableTools.Diamond ||
                    selectedTool === AvailableTools.Ellipse ||
                    selectedTool === AvailableTools.Line ||
                    selectedTool === AvailableTools.Arrow ||
                    selectedTool === AvailableTools.Text ||
                    selectedShape) && (
                    <div className="absolute top-[10%] left-20 z-100">
                        <ToolActions handleDrawAi={handleDrawAi} />
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    id="canvas"
                    className="pencil-canvas"
                    style={{
                        display: 'block',
                        cursor: cursor,
                    }}
                ></canvas>
            </div>
        </>
    );
};
