export function drawSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#3399ff';
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#3399ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
}

export function roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    strokeColor: string,
    bgColor: string,
    strokeWidth: number,
    strokeStyle: number,
) {
    const normalizedX = width < 0 ? x + width : x;
    const normalizedY = height < 0 ? y + height : y;
    const normalizedWidth = Math.abs(width);
    const normalizedHeight = Math.abs(height);
    const maxRadius = Math.min(normalizedWidth, normalizedHeight) / 2;
    const r = Math.min(radius, maxRadius);

    ctx.beginPath();
    ctx.moveTo(normalizedX + r, normalizedY);
    ctx.lineTo(normalizedX + normalizedWidth - r, normalizedY);
    ctx.arcTo(normalizedX + normalizedWidth, normalizedY, normalizedX + normalizedWidth, normalizedY + r, r);
    ctx.lineTo(normalizedX + normalizedWidth, normalizedY + normalizedHeight - r);
    ctx.arcTo(
        normalizedX + normalizedWidth,
        normalizedY + normalizedHeight,
        normalizedX + normalizedWidth - r,
        normalizedY + normalizedHeight,
        r,
    );
    ctx.lineTo(normalizedX + r, normalizedY + normalizedHeight);
    ctx.arcTo(normalizedX, normalizedY + normalizedHeight, normalizedX, normalizedY + normalizedHeight - r, r);
    ctx.lineTo(normalizedX, normalizedY + r);
    ctx.arcTo(normalizedX, normalizedY, normalizedX + r, normalizedY, r);
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.setLineDash([strokeStyle, strokeStyle]);
    ctx.strokeStyle = strokeColor;
    ctx.closePath();
    ctx.stroke();
}

export function ellipse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    strokeColor: string,
    bgColor: string,
    strokeWidth: number,
    strokeStyle: number,
    rotation: number = 0,
    startAngle: number = 0,
    endAngle: number = 2 * Math.PI,
) {
    ctx.beginPath();
    ctx.ellipse(x + radiusX, y + radiusY, radiusX, radiusY, rotation, startAngle, endAngle);
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.setLineDash([strokeStyle, strokeStyle]);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}

export function drawDiamond(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    strokeColor: string,
    bgColor: string,
    strokeWidth: number,
    strokeStyle: number,
) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const top = { x: centerX, y: y };
    const right = { x: x + width, y: centerY };
    const bottom = { x: centerX, y: y + height };
    const left = { x: x, y: centerY };

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(left.x, left.y);

    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.setLineDash([strokeStyle, strokeStyle]);
    ctx.strokeStyle = strokeColor;
    ctx.closePath();
    ctx.stroke();
}

export function drawLine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dx: number,
    dy: number,
    strokeColor: string,
    strokeWidth: number,
    strokeStyle: number,
) {
    ctx.beginPath();
    // start
    ctx.moveTo(x, y);
    //end
    ctx.lineTo(x + dx, y + dy);
    ctx.lineWidth = strokeWidth;
    ctx.setLineDash([strokeStyle, strokeStyle]);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}

export function drawArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dx: number,
    dy: number,
    strokeColor: string,
    strokeWidth: number,
    strokeStyle: number,
) {
    const headLength = Math.max(12, strokeWidth * 1.5);
    const headAngle = Math.PI / 6;

    const endX = x + dx;
    const endY = y + dy;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = strokeWidth;
    ctx.setLineDash([strokeStyle, strokeStyle]);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // head
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - headAngle), endY - headLength * Math.sin(angle - headAngle));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle + headAngle), endY - headLength * Math.sin(angle + headAngle));
    ctx.lineWidth = strokeWidth;
    ctx.setLineDash([strokeStyle, strokeStyle]);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}

export function drawText(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    fontSize: string,
    color: string,
) {
    ctx.font = `${fontSize} Playpen Sans, Arial`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}
