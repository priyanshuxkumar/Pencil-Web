interface Chat {
    message: string;
    setMessage: (value: string) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleSubmit: () => void;
    isGenerating: boolean;
}

export default function Chat({ message, setMessage, handleKeyDown, handleSubmit, isGenerating }: Chat) {
    return (
        <div className="space-y-4 bg-white z-100">
            <div className="relative">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    placeholder="Type your message here..."
                    className="w-full min-h-[120px] p-4 pr-16 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    rows={4}
                />
                <div className="absolute bottom-3 right-3">
                    <button
                        onClick={handleSubmit}
                        disabled={!message.trim() || isGenerating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                    >
                        {isGenerating ? 'Generating' : 'Send'}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Press Cmd/Ctrl + Enter to send</span>
                <span className={`${message.length > 500 ? 'text-red-500' : ''}`}>{message.length}/500</span>
            </div>
        </div>
    );
}
