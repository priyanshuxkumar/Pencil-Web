import type { RoomUser } from '../components/Canvas';
import type { Shape } from './shapes.types';

// Send event types
export type SocketMessage =
    | { type: 'join-room'; payload: { roomId: string; userId: string } }
    | { type: 'join'; payload: { roomId: string; shapes?: Shape[] } }
    | { type: 'create-shape'; payload: { shape: Shape; roomId: string } }
    | { type: 'remove-shape'; payload: { shapeId: string } }
    | { type: 'cursor-position'; payload: { roomId: string; x: number; y: number } }
    | { type: 'select-shape'; payload: { roomId: string; shapeId?: string } }
    | { type: 'resize-shape'; payload: { roomId: string; shape: Shape } }
    | { type: 'clear-canvas' };

// Server events
export type ServerSocketEvent =
    | { type: 'joined'; data: { name: string; userId: string; roomId: string }; message: string }
    | { type: 'room-joined'; data: { name: string; userId: string; roomId: string; shapes: Shape[]; existingUsers: RoomUser[] } }
    | { type: 'user-room-joined'; data: RoomUser }
    | { type: 'shape-created'; data: { shape: Shape; name: string } }
    | { type: 'shape-removed'; data: { shapeId: string; name: string } }
    | { type: 'cursor-position'; data: { id: string; name: string; roomId: string; x: number; y: number } }
    | { type: 'selected-shape'; data: { shapeId: string } }
    | { type: 'resized-shape'; data: { updatedShape: Shape } }
    | { type: 'user-exit'; data: { userId: string; roomId: string } }
    | { type: 'error'; message: string }
    | { type: 'canvas-cleared' }