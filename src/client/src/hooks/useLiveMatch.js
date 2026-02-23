import { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';

export const useLiveMatch = (matchId) => {
    const [commentary, setCommentary] = useState([]);
    const [score, setScore] = useState({ home: 0, away: 0 });

    const { lastJsonMessage, sendJsonMessage } = useWebSocket('ws://localhost:8000/ws', {
        onOpen: () => {
            console.log('Connected to Match Feed');
            // FIX: You MUST tell the backend which match you want!
            if (matchId) {
                sendJsonMessage({ type: "subscribe", matchId: Number(matchId) });
            }
        },
        shouldReconnect: () => true,
    });

    useEffect(() => {
        if (lastJsonMessage) {
            // FIX: Access the nested 'data' property from your backend payload
            const msgData = lastJsonMessage.data || lastJsonMessage;

            // Check if the match ID matches (ensuring both are Numbers)
            if (Number(msgData.matchId) === Number(matchId)) {
                setCommentary((prev) => {
                    // Prevent duplicate sequence numbers
                    if (prev.find(m => m.sequence === msgData.sequence)) return prev;
                    return [msgData, ...prev];
                });

                // Update scores if they exist in the payload
                if (msgData.homeScore !== undefined || msgData.awayScore !== undefined) {
                    setScore({
                        home: msgData.homeScore ?? 0,
                        away: msgData.awayScore ?? 0
                    });
                }
            }
        }
    }, [lastJsonMessage, matchId]);

    return { commentary, score };
};