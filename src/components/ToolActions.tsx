import { useState } from 'react';
import Chat from './Chat';
import { useTools } from '../hook/useTools';
import { useCanvas } from '../hook/useCanvas';
import { EDGES, STROKE_COLORS, STROKE_STYLES, STROKE_WIDTHS, BACKGROUND_COLORS, TEXT_SIZE } from '../constant/canvas';
import { AvailableTools } from '../types/tools.types';
import type { Shape } from '../types/shapes.types';

export default function ToolActions({ handleDrawAi }: { handleDrawAi: (shapes: Shape[]) => void }) {
    const [inputMessage, setInputMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const { selectedShape, deleteShape } = useCanvas();

    const {
        selectedTool,
        selectedStrokeColor,
        setSelectedStrokeColor,
        selectedBackgroundColor,
        setSelectedBackgroundColor,
        selectedStrokeWidth,
        setSelectedStrokeWidth,
        selectedStrokeStyle,
        setSelectedStrokeStyle,
        selectedEdges,
        setSelectedEdges,
        setSelectedTextSize,
    } = useTools();

    const handleSubmit = async () => {
        try {
            if (inputMessage.trim()) {
                setIsGenerating(true);

                const response = await fetch(`${import.meta.env.VITE_APP_HTTP_URL}/draw`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: inputMessage,
                    }),
                });

                const data = await response.json();
                if (data.content) {
                    handleDrawAi(data.content);
                    setInputMessage('');
                }
            }
        } catch (err: unknown) {
            console.log(err);
            alert('Failed to generate diagram');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    if (!selectedShape && selectedTool === AvailableTools.Selection) return null;

    if (selectedTool === AvailableTools.Pen || selectedTool === AvailableTools.Hand) {
        return null;
    }

    if (selectedTool === AvailableTools.AI) {
        return (
            <Chat
                message={inputMessage}
                setMessage={setInputMessage}
                handleSubmit={handleSubmit}
                handleKeyDown={handleKeyDown}
                isGenerating={isGenerating}
            />
        );
    }

    return (
        <div className="w-50 bg-neutral-100 border border-gray-200 rounded-2xl p-4">
            {/* Stroke Colors */}
            <div className="mb-6">
                <h3 className="text-sm mb-3 text-black">Stroke</h3>
                <div className="flex gap-1.5">
                    {STROKE_COLORS.map((color, index) => (
                        <button
                            key={index}
                            className={`w-6 h-6 rounded-full border transition-all duration-200
                            ${selectedStrokeColor === index ? 'ring-2 ring-offset-2 ring-black' : 'border-gray-300'}
                            hover:scale-110 hover:shadow-md`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedStrokeColor(index)}
                            aria-label={`Select stroke color ${color}`}
                        />
                    ))}
                </div>
            </div>

            {/* Background Colors */}
            {(selectedTool === AvailableTools.Rectangle ||
                selectedTool === AvailableTools.Diamond ||
                selectedTool === AvailableTools.Ellipse ||
                selectedShape?.type === 'rectangle') && (
                <div className="mb-6">
                    <h3 className="text-sm mb-3 text-black">Background</h3>
                    <div className="flex gap-1.5">
                        {BACKGROUND_COLORS.map((color, index) => (
                            <button
                                key={index}
                                className={`w-5 h-5 rounded-full transition-all duration-200
                            ${
                                selectedBackgroundColor === index
                                    ? 'ring-2 ring-offset-2 ring-white'
                                    : 'border-2 border-gray-600'
                            }
                            hover:scale-110 hover:shadow-md`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedBackgroundColor(index)}
                                aria-label={`Select background color ${color}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Stroke Width */}
            {(selectedTool === AvailableTools.Rectangle ||
                selectedTool === AvailableTools.Ellipse ||
                selectedTool === AvailableTools.Diamond ||
                selectedShape?.type === 'rectangle') && (
                <div className="mb-6">
                    <h3 className="text-sm mb-2 text-black">Stroke Width</h3>
                    <div className="flex gap-2">
                        {STROKE_WIDTHS.map((width, idx) => (
                            <button
                                key={width}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150
                            ${
                                STROKE_WIDTHS[selectedStrokeWidth] === width
                                    ? 'ring-2 ring-indigo-500 bg-gray-800'
                                    : 'bg-gray-700'
                            }
                            hover:scale-105 hover:shadow-sm`}
                                onClick={() => setSelectedStrokeWidth(idx)}
                                aria-label={`Stroke width ${width + 1}`}
                            >
                                <div
                                    className="bg-white rounded-full"
                                    style={{
                                        width: '24px',
                                        height: width === 1 ? '1px' : width === 3 ? '2px' : '3px',
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stroke Style */}
            {selectedTool !== AvailableTools.Text && (
                <div className="mb-6">
                    <h3 className="text-sm mb-2 text-black">Stroke Style</h3>
                    <div className="flex gap-2">
                        {STROKE_STYLES.map((style, idx) => (
                            <button
                                key={style}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150
                            ${selectedStrokeStyle === style ? 'ring-2 ring-indigo-500 bg-gray-800' : 'bg-gray-700'}
                            hover:scale-105 hover:shadow-sm`}
                                onClick={() => setSelectedStrokeStyle(idx)}
                                aria-label={`Stroke style ${style}`}
                            >
                                <div
                                    className="w-6 h-0.5 bg-white"
                                    style={{
                                        backgroundColor: 'white',
                                        backgroundImage:
                                            style === 1
                                                ? 'repeating-linear-gradient(to right, white 0, white 3px, transparent 3px, transparent 6px)'
                                                : style === 3
                                                ? 'repeating-linear-gradient(to right, white 0, white 1px, transparent 1px, transparent 3px)'
                                                : 'none',
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Edges */}
            {(selectedTool === AvailableTools.Rectangle || selectedShape?.type === 'rectangle') && (
                <div className="mb-6">
                    <h3 className="text-sm mb-2 text-black">Edges</h3>
                    <div className="flex gap-2">
                        {EDGES.map((edge, idx) => (
                            <button
                                key={edge}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150
                                ${EDGES[selectedEdges] === edge ? 'ring-2 ring-indigo-500 bg-gray-800' : 'bg-gray-700'}
                                hover:scale-105 hover:shadow-sm`}
                                onClick={() => setSelectedEdges(idx)}
                                aria-label={`Edge ${edge === 10 ? 'rounded' : 'sharp'}`}
                            >
                                <div className={`w-6 h-6 border border-white ${edge === 10 ? 'rounded' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Text Size  */}
            {selectedTool === AvailableTools.Text && (
                <div className="mb-6">
                    <h3 className="text-sm mb-2 text-black">Text Size</h3>
                    <div className="flex gap-2">
                        {TEXT_SIZE.map((size, idx) => (
                            <button
                                key={size}
                                className={`text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150
                            ${TEXT_SIZE[idx] === size ? 'ring-2 ring-indigo-500 bg-gray-800' : 'bg-gray-700'}
                            hover:scale-105 hover:shadow-sm`}
                                onClick={() => setSelectedTextSize(TEXT_SIZE[idx])}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Remove shape button  */}
            {!!selectedShape && (
                <div>
                    <button
                        onClick={() => deleteShape(selectedShape.id)}
                        className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-2 py-1 bg-red-600 text-white hover:bg-red-700 border border-red-700 shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
