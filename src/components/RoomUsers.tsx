'use client';

import { useState, useRef, useEffect } from 'react';
import type { RoomUser } from './Canvas';

function randomColorGen() {
    const alpha = '0123456789ABCDEF';
    let hex = '';
    for (let i = 0; i < 6; i++) {
        const randomNum = Math.floor(Math.random() * 16);
        const char = alpha.charAt(randomNum);
        hex += char;
    }
    return `#${hex}`;
}

export default function RoomUsersInfo({ roomUsers }: { roomUsers: RoomUser[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popoverRef.current &&
                buttonRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);
    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 bg-white text-gray-900 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
                +{roomUsers.length}
            </button>
            {isOpen && (
                <div
                    ref={popoverRef}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                >
                    <div className="p-2">
                        {roomUsers?.map((item: RoomUser) => {
                            const avatarColor = randomColorGen();
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                                        style={{ backgroundColor: avatarColor }}
                                    >
                                        <span className="text-white font-semibold text-xs">{item.name[0]}</span>
                                    </div>
                                    <span className="text-gray-900 text-xs">{item.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
