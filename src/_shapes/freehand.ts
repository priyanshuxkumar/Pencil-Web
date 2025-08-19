import { PRECISION_REGEX } from '../constant/canvas';
import type { Points, Shape } from '../types/shapes.types';
import { AvailableTools } from '../types/tools.types';
import { getStroke } from 'perfect-freehand';

export const drawPen = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    if (shape.type !== AvailableTools.Pen || !shape.points) return;

    const path = new Path2D(penStrokePath(shape.points));
    ctx.fillStyle = '#000';
    ctx.closePath();
    ctx.fill(path);
};

const penStrokePath = (points: Points[]) => {
    const inputPoints = points.map((point) => [point.x, point.y, point.pressure || 0.5]);
    if (!inputPoints.length) return;

    const options = {
        size: 4,
        streamline: 0.5,
        thinning: 0.5,
        smoothing: 0.5,
        last: true,
        easing: (t: number) => Math.sin((t * Math.PI) / 2),
    };
    const outlinePoints = getStroke(inputPoints, options);
    return getSvgPathFromOutlinePoints(outlinePoints);
};

/**
 * Returns the midpoint (average) between two points.
 */
function average(pointA: number[], pointB: number[]): number[] {
    return [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2];
}

/**
 * Converts an array of outline points into  SVG path string.
 */
function getSvgPathFromOutlinePoints(points: number[][]) {
    if (points.length < 4) return ``;

    const max = points.length - 1;
    return points
        .reduce(
            (acc, point, i, arr) => {
                if (i === max) {
                    acc.push(point, average(point, arr[0]), 'L', arr[0], 'Z');
                } else {
                    acc.push(point, average(point, arr[i + 1]));
                }
                return acc;
            },
            ['M', points[0], 'Q'],
        )
        .join(' ')
        .replace(PRECISION_REGEX, '$1');
}
