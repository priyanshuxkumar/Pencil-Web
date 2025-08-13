import type { Shape } from "./shapes.types";

type JoinRoom = {
    type: 'join-room';
    payload: {
        roomId?: string;
        userId?: string;
    };
};

type UserJoin = {
    type: 'join';
    payload: {
        roomId?: string;
        shapes?: Shape[];
    };
};

type ShapeCreated = {
    type: 'create-shape';
    payload: {
        shape?: Shape;
        roomId?: string;
    };
};

type RemoveShape = {
    type: 'remove-shape';
    payload: {
        shapeId?: string;
        roomId?: string;
    };
};

type CursorPosition = {
    type: 'cursor-position';
    payload: {
        roomId?: string;
        x?: number;
        y?: number;
    };
};

type SelectShape = {
    type: 'select-shape';
    payload: {
        roomId: string;
        shapeId?: string;
    };
};

type ShapeResize = {
    type: 'resize-shape';
    payload: {
        roomId?: string;
        shape?: Shape;
    };
};


export type SocketMessage =
    | JoinRoom
    | UserJoin
    | ShapeCreated
    | RemoveShape
    | CursorPosition
    | SelectShape
    | ShapeResize;
