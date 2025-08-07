interface Cursor {
    x: number;
    y: number;
    username: string;
    color: string;
}

const Cursor = ({ x, y, username, color = '#3b82f6' }: Cursor) => {
    return (
        <div
            className="absolute pointer-events-none z-50 transition-all duration-75 ease-out"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-2px, -2px)',
            }}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
                <path
                    d="M5.5 3L21 12L13 14L9 21L5.5 3Z"
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>

            <div
                className="absolute top-5 left-3 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
                style={{ backgroundColor: color }}
            >
                {username}
            </div>
        </div>
    );
};

export default Cursor;
