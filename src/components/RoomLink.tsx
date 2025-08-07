import { Copy, Square, Lock, Check } from 'lucide-react';
import { useState } from 'react';

const RoomLink = ({
    handleEndSession,
    handleLinkModal,
    link,
}: {
    handleEndSession: () => void;
    handleLinkModal: () => void;
    link: string;
}) => {
    const url = window.location.href;
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
    };
    return (
        <div className="h-screen flex justify-center items-center bg-black/20 p-3">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-black/5 bg-white/75 p-8 shadow-xl backdrop-blur-xl sm:p-10">
                <header className="mb-8 text-center">
                    <h1
                        className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
                    >
                        Live collaboration
                    </h1>
                </header>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                            <label htmlFor="invite-link" className="sr-only">
                                Invite link
                            </label>
                            <input
                                id="invite-link"
                                type="text"
                                value={link || url}
                                readOnly
                                className="w-full flex-1 rounded-2xl border-2 border-neutral-200 bg-white px-5 py-4 text-lg text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-300"
                                placeholder="Generating link…"
                                onFocus={(e) => e.currentTarget.select()}
                            />
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#465C88] px-5 py-4 font-medium text-white "
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-5 w-5" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-5 w-5" />
                                        Copy link
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="my-4 border-t border-neutral-200" />

                    <div className="flex items-start gap-3">
                        <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
                        <p className="leading-relaxed text-neutral-700">
                            {
                                "Don't worry, the session is end-to-end encrypted, and fully private. Not even our server can see what you draw."
                            }
                        </p>
                    </div>

                    <p className="mb-2 leading-relaxed text-neutral-600">
                        Stopping the session will disconnect you from the room, but you'll be able to continue working
                        with the scene locally. This won't affect other people; they'll still collaborate on their
                        version.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleEndSession}
                            className="inline-flex items-center gap-2 rounded-2xl border-2 border-red-500 bg-white px-6 py-3 font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <Square className="h-4 w-4 fill-current" />
                            Stop session
                        </button>

                        <button
                            type="button"
                            onClick={handleLinkModal}
                            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-medium text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomLink;
