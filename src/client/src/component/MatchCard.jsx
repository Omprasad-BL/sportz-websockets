// client/src/components/MatchCard.jsx
export const MatchCard = ({ match }) => (
    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-4">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold uppercase">{match.sport}</span>
            <span className="flex items-center text-red-500 font-bold text-xs">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></span> LIVE
      </span>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between font-bold text-lg">
                <span>{match.homeTeam}</span>
                <span className="bg-gray-800 text-white px-2 rounded">{match.homeScore}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
                <span>{match.awayTeam}</span>
                <span className="bg-yellow-400 border border-black px-2 rounded">{match.awayScore}</span>
            </div>
        </div>
        <button className="mt-4 w-full py-2 bg-yellow-400 border-2 border-black font-bold hover:bg-yellow-300 transition-colors">
            Watch Live
        </button>
    </div>
);