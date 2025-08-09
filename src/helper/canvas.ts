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