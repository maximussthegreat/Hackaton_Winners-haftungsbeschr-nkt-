'use client';

export default function SystemConsole({ logs }: { logs: string[] }) {
    return (
        <div className="bg-black/80 border border-cyan-900/50 p-4 rounded-lg font-mono text-xs w-96 backdrop-blur-sm">
            <h3 className="text-cyan-400 mb-2 border-b border-cyan-900 pb-1 flex justify-between">
                <span>NEURO-LINK TERMINAL</span>
                <span className="animate-pulse">● LIVE</span>
            </h3>
            <div className="space-y-1 h-32 overflow-hidden flex flex-col justify-end">
                {logs.map((log, i) => (
                    <div key={i} className="text-cyan-100/80 truncate">
                        <span className="text-cyan-600 mr-2">{'>'}</span>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
