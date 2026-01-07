import React from 'react';
import ReactMarkdown from 'react-markdown';
import yaml from 'js-yaml';
import { cn } from '@/lib/utils';
import { GlassDetailCard } from '../glass/GlassDetailCard';
import { GlassSceneCard } from '../glass/GlassSceneCard';
import { GlassQuizCard } from '../glass/GlassQuizCard';
import { GlassSpeakingCard } from '../glass/GlassSpeakingCard';
import { GlassExampleCard } from '../glass/GlassExampleCard';
import { GlassSpellingCard } from '../glass/GlassSpellingCard';
import { PrismWordJourney } from '../prism/PrismWordJourney';

interface MarkdownRendererProps {
    content: string;
}

interface UIBlockProps {
    code: string;
}

const UIBlock: React.FC<UIBlockProps> = ({ code }) => {
    let data: any = null;
    let error: string | null = null;

    try {
        data = yaml.load(code);
    } catch (e) {
        error = (e as Error).message;
    }

    // Jitter Fix: If data is invalid (streaming incomplete), show a Skeleton instead of Error
    // This maintains layout stability and prevents "red flash"
    if (error || !data || typeof data !== 'object') {
        return (
            <div className="w-full h-48 my-4 rounded-3xl bg-white/20 dark:bg-black/10 animate-pulse border border-white/10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-indigo-400/50">
                    <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span className="text-xs font-mono">Generative UI...</span>
                </div>
            </div>
        );
    }

    // Render based on 'type' field in YAML
    switch (data.type) {
        case 'detail':
            return (
                <GlassDetailCard
                    word={data.word}
                    phonetic={data.phonetic || data.ipa} // Support 'ipa' alias
                    definition={data.definition || data.def} // Support 'def' alias
                    englishDefinition={data.englishDefinition || data.def_en}
                    sentence={data.exampleSentence || data.example || data.sentence} // Support aliases
                    sentenceTranslation={data.exampleTranslation || data.trans}
                />
            );

        case 'scene':
            return (
                <GlassSceneCard
                    loc={data.loc || data.location}
                    role_ai={data.role_ai}
                    role_user={data.role_user}
                />
            );

        case 'quiz':
            return (
                <GlassQuizCard
                    question={data.question}
                    options={data.options}
                    explanation={data.explanation}
                />
            );

        case 'speaking':
            return (
                <GlassSpeakingCard
                    sentence={data.sentence}
                    trans={data.trans || data.translation}
                />
            );

        case 'vote':
            // Re-use Quiz Card for Voting (Single Selection)
            return (
                <GlassQuizCard
                    question=""  // No question header for simple polls
                    options={data.options}
                />
            );

        case 'spelling_writing':
            return (
                <GlassSpellingCard
                    type='spelling_writing'
                    word={data.word || ''}
                    hint={data.hint}
                    definition={data.definition}
                    exampleSentence={data.exampleSentence || data.sentence}
                />
            );

        case 'example':
            return (
                <GlassExampleCard
                    word={data.word || ''}
                    examples={data.examples || []}
                />
            );

        case 'journey':
            return (
                <PrismWordJourney
                    word={data.word}
                    phonetic={data.phonetic || data.ipa}
                    definition={data.definition || data.def}
                    englishDefinition={data.englishDefinition || data.def_en}
                    supplement={data.supplement || data.aiSupplement}
                    examples={data.examples}
                    collocations={data.collocations}
                />
            );

        default:
            return (
                <div className="p-4 bg-red-50/50 border border-red-200 rounded-lg text-xs text-red-500 font-mono">
                    Unknown UI Type: {data.type}
                </div>
            );
    }
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown
                components={{
                    code(props: any) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const isUI = match && match[1] === 'ui';

                        if (isUI) {
                            return <UIBlock code={String(children).replace(/\n$/, '')} />;
                        }

                        return (
                            <code className={cn("bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-600 dark:text-indigo-300", className)} {...rest}>
                                {children}
                            </code>
                        );
                    },
                    p({ children }) {
                        return <p className="mb-2 last:mb-0">{children}</p>;
                    },
                    // 强调文本渲染为黄色
                    strong({ children }) {
                        return <strong className="font-bold text-yellow-500 dark:text-yellow-400">{children}</strong>;
                    },
                    em({ children }) {
                        return <em className="italic text-yellow-500 dark:text-yellow-400">{children}</em>;
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
