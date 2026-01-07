// Sample of NGSL (New General Service List) - Core frequency words
export const NGSL_SAMPLE = [
    { word: "opportunity", phonetic: "/ˌɑː.pɚˈtuː.nə.t̬i/", definition: "A time or set of circumstances that makes it possible to do something.", translation: "机会" },
    { word: "develop", phonetic: "/dɪˈvel.əp/", definition: "Grow or cause to grow and become more mature, advanced, or elaborate.", translation: "发展" },
    { word: "consider", phonetic: "/kənˈsɪd.ɚ/", definition: "Think carefully about (something), especially before making a decision.", translation: "考虑" },
    { word: "issue", phonetic: "/ˈɪʃ.uː/", definition: "An important topic or problem for debate or discussion.", translation: "问题/议题" },
    { word: "approach", phonetic: "/əˈproʊtʃ/", definition: "Speak to (someone) for the first time about something.", translation: "接近/方法" }
];

// Sample of NAWL (New Academic Word List) - Academic/Formal words
export const NAWL_SAMPLE = [
    { word: "analyze", phonetic: "/ˈæn.əl.aɪz/", definition: "Examine methodically and in detail the constitution or structure of.", translation: "分析" },
    { word: "significant", phonetic: "/sɪɡˈnɪf.ə.kənt/", definition: "Sufficiently great or important to be worthy of attention.", translation: "显著的" },
    { word: "context", phonetic: "/ˈkɑːn.text/", definition: "The circumstances that form the setting for an event, statement, or idea.", translation: "语境" },
    { word: "assess", phonetic: "/əˈses/", definition: "Evaluate or estimate the nature, ability, or quality of.", translation: "评估" },
    { word: "indicate", phonetic: "/ˈɪn.də.keɪt/", definition: "Point out; show.", translation: "表明" }
];

export function getRandomVocabulary(type: 'ngsl' | 'nawl' = 'ngsl') {
    const list = type === 'ngsl' ? NGSL_SAMPLE : NAWL_SAMPLE;
    return list[Math.floor(Math.random() * list.length)];
}
