import type { Shape } from "../types/shapes.types";
import { getLocalStorage, setLocalStorage } from "./localStorage";

export function saveShapeToLocalStorage(shape: Shape) {
    const savedShapes: [] | null = getLocalStorage('_shapes');
    if (savedShapes) {
        setLocalStorage('_shapes', [shape, ...savedShapes]);
    } else {
        setLocalStorage('_shapes', [shape]);
    }
}
