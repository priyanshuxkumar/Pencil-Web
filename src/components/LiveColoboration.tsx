import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hook/useSocket';
import type { Shape } from '../types/shapes.types';

export default function LiveCollaboration({
    onStartSession,
    shapes,
}: {
    onStartSession: (link: string, roomId: string) => void;
    shapes: Shape[];
}) {
    const { connect, socketRef, sendMessage } = useSocket();
    const navigate = useNavigate();
    const createLink = async () => {
        try {
            const res = await fetch('http://localhost:8787/gen-room-url', {
                method: 'GET',
            });

            if (!res.ok) {
                console.error('Something went wrong while creation session room');
                return;
            }

            const data = await res.json();
            // connect websocket
            connect();

            // wait for connection
            await new Promise<void>((resolve) => {
                const interval = setInterval(() => {
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 50);
            });

            onStartSession(data.inviteUrl, data.roomId);

            sendMessage({
                type: 'join',
                payload: {
                    roomId: data.roomId,
                    shapes, // existing shapes
                },
            });

            navigate(`#room=${data.roomId},${data.roomKey}`);
        } catch (err: unknown) {
            console.error('Error on create link', err);
            alert('Something went wrong. Please refresh the page and try again...')
        }
    };
    return (
        <div className="h-screen flex justify-center items-center bg-black/20 p-3">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-black/5 bg-white/70 p-8 shadow-xl backdrop-blur-xl sm:p-10">
                <header className="mb-3">
                    <h1
                        id="live-collab-title"
                        className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
                    >
                        Live collaboration
                    </h1>
                    <p className="mt-3 text-lg text-neutral-600">Invite people to collaborate on your drawing.</p>
                </header>

                <p className="mb-10 leading-relaxed text-neutral-500">
                    Everything you draw stays within this room, shared only with participants via secure WebSocket
                    connections.
                </p>

                <div className="flex flex-col items-center gap-4">
                    <button
                        type="button"
                        onClick={createLink}
                        className="group inline-flex items-center gap-2 rounded-xl bg-[#465C88] px-5 py-3 font-medium text-white"
                    >
                        <Play className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        Start session
                    </button>
                </div>
            </div>
        </div>
    );
}
