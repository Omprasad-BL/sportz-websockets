import React, { useState, useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';

const WS_URL = 'ws://localhost:8000/ws';
const API_URL = 'http://localhost:8000';

export default function App() {
    const [matches, setMatches] = useState([]);
    const [commentaries, setCommentaries] = useState([]);
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    // 1. WebSocket logic - NO LOGIC CHANGES
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(WS_URL, {
        onOpen: () => console.log('✅ Connected to Spotrz WS'),
        shouldReconnect: () => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
    });

    // 2. Initial Fetch - NO LOGIC CHANGES
    useEffect(() => {
        fetch(`${API_URL}/matches`)
            .then((res) => res.json())
            .then((payload) => {
                const data = payload.data || payload;
                const matchesArray = Array.isArray(data) ? data : [];
                setMatches(matchesArray);

                if (matchesArray.length > 0 && !selectedMatchId) {
                    const firstId = matchesArray[0].id;
                    setSelectedMatchId(firstId);
                    sendJsonMessage({ type: 'subscribe', matchId: parseInt(firstId, 10) });
                }
            });
    }, []);

    // 3. Handle Live Updates - NO LOGIC CHANGES
    useEffect(() => {
        if (lastJsonMessage) {
            const msgPayload = lastJsonMessage.data || lastJsonMessage;
            const msgMatchId = Number(msgPayload.matchId);
            const currentSelectedId = Number(selectedMatchId);

            setMatches((prevMatches) =>
                prevMatches.map((m) =>
                    Number(m.id) === msgMatchId
                        ? {
                            ...m,
                            homeScore: msgPayload.homeScore ?? m.homeScore,
                            awayScore: msgPayload.awayScore ?? m.awayScore
                        }
                        : m
                )
            );

            if (msgMatchId === currentSelectedId) {
                setCommentaries((prev) => {
                    if (prev.find(m => m.sequence === msgPayload.sequence)) return prev;
                    return [msgPayload, ...prev].slice(0, 50);
                });
            }
        }
    }, [lastJsonMessage, selectedMatchId]);

    const handleSubscribe = (id) => {
        const numId = Number(id);
        setSelectedMatchId(numId);
        setCommentaries([]);
        sendJsonMessage({ type: 'subscribe', matchId: numId });
    };

    const connectionStatus = {
        0: 'Connecting...',
        1: 'LIVE CONNECTED',
        2: 'Closing',
        3: 'Disconnected',
    }[readyState];

    // ... (Logic remains identical to preserve your working connection)

    // ... (Logic remains untouched as per your request)

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-slate-900">
            {/* HEADER */}
            <header className="bg-yellow-400 border-4 border-black p-6 rounded-2xl mb-10 flex flex-col md:flex-row justify-between items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-center md:text-left mb-4 md:mb-0">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Spotrz</h1>
                    <p className="font-bold text-lg mt-1">Real-time match data demo</p>
                </div>
                <div className={`px-6 py-3 border-4 border-black rounded-xl font-black text-sm flex items-center gap-3 ${readyState === 1 ? 'bg-white' : 'bg-red-100'}`}>
                    <span className={`w-4 h-4 rounded-full ${readyState === 1 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {connectionStatus}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* MATCH GRID */}
                <div className="lg:col-span-8">
                    <h2 className="text-3xl font-black mb-8 inline-block border-b-8 border-blue-400 pb-1">Current Matches</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {matches.map((match) => (
                            <div key={match.id} className={`bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all ${selectedMatchId === match.id ? 'ring-4 ring-blue-500 ring-offset-4' : ''}`}>
                                {/* ... Match Card Content (No changes) ... */}
                                <div className="flex justify-between items-center mb-6">
                                    <span className="bg-slate-100 border-2 border-black px-3 py-1 rounded-lg font-black text-xs uppercase tracking-widest">{match.sport || 'Match'}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                                        <span className="font-black text-red-500 text-xs uppercase">Live</span>
                                    </div>
                                </div>
                                <div className="space-y-6 mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-black leading-tight">{match.homeTeam}</span>
                                        <span className="text-3xl font-black border-4 border-black w-14 h-14 flex items-center justify-center rounded-xl">{match.homeScore ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-black leading-tight">{match.awayTeam}</span>
                                        <span className="text-3xl font-black bg-yellow-400 border-4 border-black w-14 h-14 flex items-center justify-center rounded-xl">{match.awayScore ?? 0}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleSubscribe(match.id)} className={`w-full py-4 rounded-2xl border-4 border-black font-black uppercase tracking-tight transition-all active:translate-y-1 active:shadow-none ${selectedMatchId === match.id ? 'bg-blue-500 text-white shadow-none' : 'bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                                    {selectedMatchId === match.id ? 'Watching Live' : 'Watch Live'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COMMENTARY SIDEBAR - FULL VIEWPORT HEIGHT WHEN STICKY */}
                <div className="lg:col-span-4 lg:sticky lg:top-0 h-screen lg:py-4">
                    <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-3xl font-black leading-none">Live<br/>Commentary</h2>
                            <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">Real-time</span>
                        </div>

                        {/* Internal scroll area */}
                        <div className="overflow-y-auto flex-1 space-y-6 pr-2 custom-scrollbar">
                            {commentaries.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-16 h-16 border-4 border-black border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                                    <p className="font-black text-slate-400 italic text-sm uppercase">Syncing Field Data...</p>
                                </div>
                            ) : (
                                commentaries.map((msg, i) => (
                                    <div key={i} className="bg-white border-4 border-black p-5 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-right-4">
                                        <div className="flex items-center gap-3 mb-3 text-[10px] font-black uppercase text-gray-400">
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded-md">{msg.period || '1H'}</span>
                                            <span>{msg.minute}' MIN</span>
                                            <span className="ml-auto bg-slate-100 border-2 border-black px-1.5 rounded">SEQ {msg.sequence}</span>
                                        </div>
                                        <p className="font-bold text-md text-slate-800 leading-snug">{msg.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}