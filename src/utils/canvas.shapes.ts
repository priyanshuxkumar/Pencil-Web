import { AvailableTools } from '../types/tools.types';

function createRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    strokeColor: string,
    bgColor: string,
    strokeWidth: number,
    strokeStyle: number,
    radius: number,
) {
    return {
        id: Date.now().toString(),
        type: AvailableTools.Rectangle,
        x,
        y,
        width,
        height,
        radius,
        strokeColor,
        bgColor,
        strokeWidth,
        strokeStyle,
    };
}

function createEllipse(
    x: number,
    y: number,
    width: number,
    height: number,
    strokeColor: string,
    bgColor: string,
    strokeWidth: number,
    strokeStyle: number,
) {
    return {
        id: Date.now().toString(),
        type: AvailableTools.Ellipse,
        x,
        y,
        radiusX: width / 2,
        radiusY: height / 2,
        strokeColor,
        bgColor,
        strokeWidth,
        strokeStyle,
    };
}

function createDiamond(
    x: number,
    y: number,
    width: number,
    height: number,
    strokeColor: string,
    bgColor: string,
    strokeWidth: number,
    strokeStyle: number,
) {
    return {
        id: Date.now().toString(),
        type: AvailableTools.Diamond,
        x,
        y,
        width: width,
        height: height,
        strokeColor,
        bgColor,
        strokeWidth,
        strokeStyle,
    };
}

function createArrowAndLine(
    shapetype: AvailableTools,
    x: number,
    y: number,
    endX: number,
    endY: number,
    strokeColor: string,
    strokeWidth: number,
    strokeStyle: number,
) {
    const dx = endX - x;
    const dy = endY - y;

    return {
        id: Date.now().toString(),
        type: shapetype === 'arrow' ? AvailableTools.Arrow : AvailableTools.Line,
        x,
        y,
        dx,
        dy,
        strokeColor,
        strokeWidth,
        strokeStyle,
    };
}

function createTextShape(x: number, y: number, text: string, fontSize: string, color: string) {
    return {
        id: Date.now().toString(),
        type: AvailableTools.Text,
        x,
        y,
        text,
        fontSize,
        color,
    };
}

export { createRectangle, createEllipse, createDiamond, createArrowAndLine, createTextShape };
