import { useState } from 'react';
import { Trash } from 'lucide-react';
import type { Shape } from '../types/shapes.types';
import Chat from './Chat';
import { useTools } from '../hook/useTools';
import { useCanvas } from '../hook/useCanvas';
import { EDGES, STROKE_COLORS, STROKE_STYLES, STROKE_WIDTHS, BACKGROUND_COLORS, TEXT_SIZE } from '../constant/canvas';
import { AvailableTools } from '../types/tools.types';

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
        selectedTextSize,
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
        <div className="w-50 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
            {/* Stroke Colors */}
            <ColorPicker
                title="Stroke Color"
                colors={STROKE_COLORS}
                selectedIndex={selectedStrokeColor}
                onSelect={setSelectedStrokeColor}
            />

            {/* Background Colors */}
            {(selectedTool === AvailableTools.Rectangle ||
                selectedTool === AvailableTools.Diamond ||
                selectedTool === AvailableTools.Ellipse ||
                selectedShape?.type === 'rectangle') && (
                <ColorPicker
                    title="Background Color"
                    colors={BACKGROUND_COLORS}
                    selectedIndex={selectedBackgroundColor}
                    onSelect={setSelectedBackgroundColor}
                />
            )}

            {/* Stroke Width */}
            {(selectedTool === AvailableTools.Rectangle ||
                selectedTool === AvailableTools.Ellipse ||
                selectedTool === AvailableTools.Diamond ||
                selectedShape?.type === 'rectangle') && (
                <ShapeStyleOption
                    title="Stroke Width"
                    options={STROKE_WIDTHS}
                    selected={selectedStrokeWidth}
                    onSelect={(width) => setSelectedStrokeWidth(STROKE_WIDTHS.indexOf(width))}
                    renderOption={(width) => (
                        <div
                            className="bg-gray-700 rounded-full"
                            style={{
                                width: '20px',
                                height: width === 2 ? '2px' : width === 3 ? '3px' : '5px',
                            }}
                        />
                    )}
                />
            )}

            {/* Stroke Style */}
            {selectedTool !== AvailableTools.Text && (
                <ShapeStyleOption
                    title="Stroke Style"
                    options={STROKE_STYLES}
                    selected={selectedStrokeStyle}
                    onSelect={(style) => setSelectedStrokeStyle(STROKE_STYLES.indexOf(style))}
                    renderOption={(style) => (
                        <div
                            className="border"
                            style={{
                                width: '20px',
                                height: '2px',
                                borderStyle: style === 0 ? 'solid' : 'dashed',
                            }}
                        />
                    )}
                />
            )}

            {/* Edges */}
            {(selectedTool === AvailableTools.Rectangle || selectedShape?.type === 'rectangle') && (
                <ShapeStyleOption
                    title="Edges"
                    options={EDGES}
                    selected={selectedEdges}
                    onSelect={(edge) => setSelectedEdges(EDGES.indexOf(edge))}
                    renderOption={(edge) => (
                        <div className={`w-6 h-6 border-2 border-gray-700 ${edge === 30 ? 'rounded-md' : ''}`} />
                    )}
                />
            )}

            {/* Text Size */}
            {selectedTool === AvailableTools.Text && (
                <ShapeStyleOption
                    title="Font size"
                    options={TEXT_SIZE}
                    selected={selectedTextSize}
                    onSelect={(size) => setSelectedTextSize(size)}
                    renderOption={(size) => size}
                />
            )}

            {/* Remove shape button */}
            {!!selectedShape && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <button
                        onClick={() => deleteShape(selectedShape.id)}
                        className="text-xs w-full flex items-center justify-center gap-2 px-2 py-1 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg font-medium transition-all duration-200 hover:bg-red-100 hover:border-red-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        <Trash size={15} />
                        Delete Shape
                    </button>
                </div>
            )}
        </div>
    );
}

const ColorPicker = ({
    title,
    colors,
    selectedIndex,
    onSelect,
}: {
    title: string;
    colors: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}) => {
    return (
        <div className="mb-4">
            <h3 className="text-xs mb-2 text-gray-800">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {colors.map((style, idx) => (
                    <button
                        key={idx}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 border-2
                                    ${
                                        selectedIndex === idx
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-500 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                                    }
                                    hover:scale-105`}
                        style={{ backgroundColor: style }}
                        onClick={() => onSelect(idx)}
                        aria-label={`${title} ${style}`}
                    />
                ))}
            </div>
        </div>
    );
};

type ShapeStyleOptionProps<T> = {
    title: string;
    options: T[];
    selected: T;
    onSelect: (opt: T) => void;
    renderOption: (opt: T) => React.ReactNode;
};

function ShapeStyleOption<T>({ title, options, selected, onSelect, renderOption }: ShapeStyleOptionProps<T>) {
    return (
        <div className="mb-4">
            <h3 className="text-xs mb-2 text-gray-800">{title}</h3>
            <div className="flex gap-3">
                {options.map((opt, idx) => {
                    // Font size handled using string
                    const isActive = title === 'Font size' ? opt === selected : idx === selected;
                    return (
                        <button
                            key={idx}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border-2
                            ${
                                isActive
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                            }
                            hover:scale-105`}
                            onClick={() => onSelect(opt)}
                        >
                            {renderOption(opt)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
