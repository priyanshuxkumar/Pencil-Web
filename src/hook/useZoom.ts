// hooks/useZoom.ts
import { useCallback } from 'react';

export const useZoom = (
    scale: number,
    setScale: (s: number) => void,
    panOffset: { x: number; y: number },
    setPanOffset: ({ x, y }: { x: number; y: number }) => void,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
    const handleCanvasZoom = useCallback(
        (zoomIn: boolean, zoomPoint?: { x: number; y: number }) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const zoomIntensity = 0.2;
            const minScale = 0.1;
            const maxScale = 5;

            const newScale = scale * (zoomIn ? 1 + zoomIntensity : 1 - zoomIntensity);
            const clampedScale = Math.min(maxScale, Math.max(minScale, newScale));

            const rect = canvas.getBoundingClientRect();
            const centerPoint = zoomPoint || { x: rect.width / 2, y: rect.height / 2 };

            const worldPoint = {
                x: centerPoint.x / scale - panOffset.x,
                y: centerPoint.y / scale - panOffset.y,
            };

            const newPanOffset = {
                x: centerPoint.x / clampedScale - worldPoint.x,
                y: centerPoint.y / clampedScale - worldPoint.y,
            };

            setScale(clampedScale);
            setPanOffset(newPanOffset);
        },
        [scale, panOffset, canvasRef, setScale, setPanOffset],
    );

    return { handleCanvasZoom };
};
