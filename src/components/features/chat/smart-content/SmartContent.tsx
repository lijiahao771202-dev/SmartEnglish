import React, { useMemo, useState } from 'react';
import { Play, Mic, Info, ArrowRight, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SmartContentProps {
    content: string;
}

// ==========================================
// 1. REGEX PATTERNS (The "Parser Kit")
// ==========================================

// Priority 1: Block Elements
// Support both English pipe | and Chinese pipe ｜
const FLASHCARD_REGEX = /\[Card:\s*([^|｜]+?)\s*[|｜]\s*([^|｜]+?)\s*[|｜]\s*([^|｜]+?)\s*[|｜]\s*([^|｜]+?)\]/g;
const SCENE_REGEX = /\[Scene:\s*([^|｜]+?)\s*[|｜]\s*([^|｜]+?)\s*[|｜]\s*([^|｜]+?)\]/g;
const QUOTE_REGEX = /"([^"]+)"\s*[-—]\s*([^\n]+)/g;
const VOTE_REGEX = /\[Vote\]\s*(.+)/g; // Matches: [Vote] A | B | C

// Priority 2: Inline Elements
const ACTION_REGEX = /->\s*\[([^\]]+)\]\(([^)]+)\)/g; // Matches: -> [Label](Action)
const GLOSSARY_REGEX = /\*\*([^*]+)\*\*\(([^)]+)\)/g; // Matches: **Term**(Definition)
const CLOZE_REGEX = /\{([^}]+)\}/g; // Matches: {answer}
const ENGLISH_SENTENCE_REGEX = /([A-Z][a-zA-Z\s,']{20,}[.?!])/g;

// ==========================================
// 2. SUB-COMPONENTS (The "Widget Kit")
// ==========================================

// --- A. Vote Widget ---
const VoteWidget: React.FC<{ optionsStr: string }> = ({ optionsStr }) => {
    const options = optionsStr.split('|').map(s => s.trim());
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <div className="flex flex-wrap gap-2 my-2">
            {options.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => setSelected(idx)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all transform active:scale-95 border",
                        selected === idx
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                            : "bg-white/50 hover:bg-white/80 border-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-200 dark:border-white/10"
                    )}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
};

// --- B. Cloze Input ---
const ClozeInput: React.FC<{ answer: string }> = ({ answer }) => {
    const [val, setVal] = useState("");
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    const check = () => {
        if (val.trim().toLowerCase() === answer.trim().toLowerCase()) {
            setStatus('correct');
        } else {
            setStatus('wrong');
            setTimeout(() => setStatus('idle'), 1000); // Reset shake
        }
    };

    return (
        <span className="inline-flex items-center align-middle mx-1 relative">
            <input
                type="text"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && check()}
                onBlur={check}
                className={cn(
                    "w-20 px-2 py-0.5 text-center bg-transparent border-b-2 outline-none transition-all font-mono text-indigo-600 font-bold",
                    status === 'idle' && "border-indigo-300",
                    status === 'correct' && "border-green-500 text-green-600 bg-green-50/50",
                    status === 'wrong' && "border-red-400 text-red-500 bg-red-50/50 animate-shake"
                )}
                placeholder="___"
            />
            {status === 'correct' && <Check className="absolute -right-4 w-3 h-3 text-green-500" />}
        </span>
    );
};

// --- C. Glossary Tooltip ---
const GlossarySpan: React.FC<{ term: string, def: string }> = ({ term, def }) => {
    return (
        <span className="group relative inline-block cursor-help mx-0.5">
            <span className="font-bold border-b border-dotted border-gray-400 group-hover:text-indigo-600 transition-colors">
                {term}
            </span>
            {/* Tooltip */}
            <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50">
                <Info className="inline w-3 h-3 mr-1 mb-0.5" />
                {def}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
            </span>
        </span>
    );
};

// --- D. Action Button ---
const ActionButton: React.FC<{ label: string, action: string }> = ({ label, action }) => (
    <button
        className="inline-flex items-center gap-1 px-3 py-1 my-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-md text-xs font-semibold transition-colors"
        onClick={() => console.log("Navigate to:", action)} // Todo: integrate router
    >
        {label} <ArrowRight className="w-3 h-3" />
    </button>
);

// --- E. TTS Sentence ---
const InteractiveSentence: React.FC<{ text: string }> = ({ text }) => {
    const playAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };
    return (
        <span onClick={playAudio} className="cursor-pointer border-b border-dashed border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors inline-block" title="Click to listen">
            {text} <Play className="inline w-3 h-3 ml-1 text-indigo-500 align-middle" />
        </span>
    );
};

// --- F. Flashcard Widget ---
const FlashcardWidget: React.FC<{ word: string, pron: string, def: string, sentence: string }> = ({ word, pron, def, sentence }) => {
    return (
        <div className="my-4 p-5 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transform transition-all hover:scale-[1.01]">
            <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-2xl font-bold tracking-tight">{word}</h3>
                <span className="text-sm opacity-80 font-mono tracking-wider">{pron}</span>
            </div>
            <div className="text-base font-medium opacity-90 mb-4 pb-4 border-b border-white/20">
                {def}
            </div>
            <div className="text-sm italic opacity-80 bg-black/10 p-3 rounded-xl border border-white/10">
                "{sentence}"
            </div>
        </div>
    );
};

// --- G. Scene Widget ---
const SceneWidget: React.FC<{ loc: string, roleA: string, roleB: string }> = ({ loc, roleA, roleB }) => {
    return (
        <div className="my-3 flex items-center gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-4 py-2 rounded-full w-fit border border-gray-200 dark:border-gray-700">
            <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md">
                🎬 SCENE
            </span>
            <span className="opacity-80">📍 {loc}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="opacity-80">👤 {roleA} & {roleB}</span>
        </div>
    );
};

// ==========================================
// 3. MAIN COMPONENT (Recursive Parser)
// ==========================================

export const SmartContent: React.FC<SmartContentProps> = ({ content }) => {

    const parseContent = (text: string): React.ReactNode[] => {
        let nodes: React.ReactNode[] = [text];

        // Helper to map nodes and split strings
        const applyRegex = (regex: RegExp, renderer: (match: string, ...args: any[]) => React.ReactNode) => {
            const newNodes: React.ReactNode[] = [];
            nodes.forEach(node => {
                if (typeof node === 'string') {
                    let cursor = 0;
                    regex.lastIndex = 0;
                    let match;
                    let localNodes: React.ReactNode[] = [];

                    while ((match = regex.exec(node)) !== null) {
                        if (match.index > cursor) {
                            localNodes.push(node.slice(cursor, match.index));
                        }
                        localNodes.push(renderer(match[0], ...match.slice(1)));
                        cursor = match.index + match[0].length;
                    }
                    if (cursor < node.length) localNodes.push(node.slice(cursor));

                    newNodes.push(...localNodes);
                } else {
                    newNodes.push(node);
                }
            });
            nodes = newNodes;
        };

        // 0. Flashcard (Highest Priority - Block)
        applyRegex(FLASHCARD_REGEX, (_, word, pron, def, sent) => (
            <FlashcardWidget
                key={`fc-${Math.random().toString(36).substr(2, 9)}`}
                word={word}
                pron={pron}
                def={def}
                sentence={sent}
            />
        ));

        // 0.5 Scene Widget
        applyRegex(SCENE_REGEX, (_, loc, roleA, roleB) => (
            <SceneWidget
                key={`sc-${Math.random().toString(36).substr(2, 9)}`}
                loc={loc}
                roleA={roleA}
                roleB={roleB}
            />
        ));

        // 1. Quotes
        applyRegex(QUOTE_REGEX, (_, quote, source) => (
            <div key={`q-${Math.random().toString(36).substr(2, 9)}`} className="my-3 p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-white/20 backdrop-blur-sm shadow-sm group">
                <p className="text-lg font-serif italic text-gray-800 dark:text-gray-100 mb-2">"{quote}"</p>
                <p className="text-sm text-right text-gray-500">— {source}</p>
            </div>
        ));

        // 2. Votes [Vote] A | B
        applyRegex(VOTE_REGEX, (_, options) => <VoteWidget key={`v-${Math.random().toString(36).substr(2, 9)}`} optionsStr={options} />);

        // 3. Actions -> [Label](Link)
        applyRegex(ACTION_REGEX, (_, label, link) => <ActionButton key={`a-${Math.random().toString(36).substr(2, 9)}`} label={label} action={link} />);

        // 4. Glossary **Term**(Def)
        applyRegex(GLOSSARY_REGEX, (_, term, def) => <GlossarySpan key={`g-${Math.random().toString(36).substr(2, 9)}`} term={term} def={def} />);

        // 5. Cloze {answer}
        applyRegex(CLOZE_REGEX, (_, ans) => <ClozeInput key={`c-${Math.random().toString(36).substr(2, 9)}`} answer={ans} />);

        // 6. English Sentences (Lowest priority)
        applyRegex(ENGLISH_SENTENCE_REGEX, (_, sent) => <InteractiveSentence key={`t-${Math.random().toString(36).substr(2, 9)}`} text={sent} />);

        return nodes;
    };

    const parts = useMemo(() => parseContent(content), [content]);

    return (
        <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
            {parts}
        </div>
    );
};
