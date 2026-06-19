import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Lightbulb, BookOpen, RotateCcw, Trophy, ArrowLeft, Settings2, PlayCircle, Sparkles, Search, Loader2 } from 'lucide-react';

// --- DYNAMIC AI MOCK GENERATOR ---
// This simulates an AI backend generating questions based on the student's custom topic
const generateDynamicQuestions = (topic, count) => {
    const generated = [];
    const safeTopic = topic || "General Knowledge";

    for (let i = 0; i < count; i++) {
        generated.push({
            id: `q_${i + 1}`,
            question: `Question ${i + 1}: Which of the following is a key concept related to ${safeTopic}?`,
            options: [
                `Primary principle of ${safeTopic}`,
                `Secondary aspect of ${safeTopic}`,
                `Common misconception about ${safeTopic}`,
                `Irrelevant detail`
            ],
            // Randomize the correct answer slightly for the mock
            correctIndex: i % 3,
            explanation: `This is correct because understanding this principle is fundamental to mastering ${safeTopic}.`
        });
    }
    return generated;
};

// Quick-pick suggestions for students who don't want to type
const QUICK_TOPICS = ["Algebra", "Cell Biology", "World War II", "Periodic Table"];

export default function CBTPracticeMode() {
    // State for the flow
    const [topicInput, setTopicInput] = useState("");
    const [activeTopic, setActiveTopic] = useState(null);
    const [questionCount, setQuestionCount] = useState(10);

    // State for generation and practice
    const [isGenerating, setIsGenerating] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [activeQuestions, setActiveQuestions] = useState([]);

    // State for answers
    const [selections, setSelections] = useState({});
    const [checked, setChecked] = useState({});

    // VIEW 1: TOPIC INPUT SCREEN
    if (!activeTopic) {
        return (
            <div className="max-w-4xl mx-auto mb-10">
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-10 rounded-3xl shadow-xl mb-8 text-center relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                            <Sparkles size={32} className="text-yellow-300" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
                            AI Practice Hub
                        </h2>
                        <p className="text-indigo-100 font-medium text-lg mb-8 max-w-xl mx-auto">
                            What do you want to learn today? Enter any subject, topic, or concept and our AI will generate a custom practice session just for you.
                        </p>

                        {/* Custom Input Bar */}
                        <div className="relative max-w-2xl mx-auto flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-4 text-slate-400" size={24} />
                                <input
                                    type="text"
                                    placeholder="e.g., Photosynthesis, Fractions, Nigerian History..."
                                    value={topicInput}
                                    onChange={(e) => setTopicInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && topicInput.trim()) setActiveTopic(topicInput.trim()) }}
                                    className="w-full pl-12 pr-6 py-4 rounded-xl text-lg font-bold text-indigo-950 font-extrabold focus:outline-none focus:ring-4 focus:ring-purple-400/50 shadow-lg"
                                />
                            </div>
                            <button
                                disabled={!topicInput.trim()}
                                onClick={() => setActiveTopic(topicInput.trim())}
                                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 rounded-xl font-black uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                Go
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Picks */}
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Or choose a quick topic</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {QUICK_TOPICS.map(topic => (
                            <button
                                key={topic}
                                onClick={() => setActiveTopic(topic)}
                                className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-full hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // VIEW 2: CONFIGURATION & GENERATION SCREEN
    if (!isStarted) {
        const handleGenerate = () => {
            setIsGenerating(true);
            // Simulate AI generation delay
            setTimeout(() => {
                const generated = generateDynamicQuestions(activeTopic, questionCount);
                setActiveQuestions(generated);
                setIsGenerating(false);
                setIsStarted(true);
            }, 1500);
        };

        return (
            <div className="max-w-2xl mx-auto mb-10">
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">

                    {isGenerating ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <Loader2 size={64} className="text-indigo-600 animate-spin mb-6" />
                            <h2 className="text-2xl font-black text-indigo-950 font-extrabold uppercase tracking-tight mb-2">
                                Generating Questions...
                            </h2>
                            <p className="text-slate-500 font-medium font-medium">
                                Our AI is building a custom practice set for <strong className="text-indigo-600">{activeTopic}</strong>.
                            </p>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setActiveTopic(null)}
                                className="absolute top-8 left-8 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 bg-indigo-50 text-indigo-600">
                                <Settings2 size={36} />
                            </div>

                            <h2 className="text-2xl font-black text-indigo-950 font-extrabold uppercase tracking-tight mb-2">
                                Configure Practice
                            </h2>
                            <p className="text-slate-500 font-medium font-medium mb-10">
                                How many questions do you want to attempt for <strong className="text-indigo-600">{activeTopic}</strong>?
                            </p>

                            <div className="mb-10 px-4 md:px-12">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-sm font-bold text-slate-400">1</span>
                                    <span className="text-4xl font-black text-indigo-600">{questionCount}</span>
                                    <span className="text-sm font-bold text-slate-400">60 Max</span>
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max="60"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />

                                <div className="flex gap-3 justify-center mt-6">
                                    {[10, 20, 30, 60].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setQuestionCount(num)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${questionCount === num ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold text-white border-indigo-600' : 'bg-white text-slate-500 font-medium border-slate-200 hover:border-slate-400'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                className="w-full py-4 rounded-xl text-lg font-black uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold"
                            >
                                <Sparkles size={24} /> Generate & Start
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // VIEW 3: ACTIVE PRACTICE SESSION
    const totalQuestions = activeQuestions.length;
    const answeredQuestions = Object.keys(checked).length;
    const isComplete = answeredQuestions === totalQuestions;

    const handleSelect = (qId, optionIndex) => {
        if (checked[qId]) return;
        setSelections(prev => ({ ...prev, [qId]: optionIndex }));
    };

    const handleCheck = (qId) => {
        if (selections[qId] === undefined) return;
        setChecked(prev => ({ ...prev, [qId]: true }));
    };

    const handleRetake = () => {
        setSelections({});
        setChecked({});
        setIsStarted(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExit = () => {
        setActiveTopic(null);
        setIsStarted(false);
        setSelections({});
        setChecked({});
        setTopicInput("");
    };

    const correctCount = activeQuestions.reduce((acc, q) => {
        if (checked[q.id] && selections[q.id] === q.correctIndex) return acc + 1;
        return acc;
    }, 0);

    return (
        <div className="max-w-4xl mx-auto mb-10">

            {/* Session Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-20 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsStarted(false)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                        title="Back to Setup"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-indigo-950 font-extrabold uppercase tracking-tight flex items-center gap-2">
                            <span className="text-indigo-600">{activeTopic}</span> Practice
                        </h2>
                        <p className="text-sm font-bold text-slate-500 font-medium mt-1">AI-Generated Session</p>
                    </div>
                </div>
                <div className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Question {answeredQuestions} of {totalQuestions}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                ></div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
                {activeQuestions.map((q, index) => {
                    const isChecked = checked[q.id];
                    const selectedOption = selections[q.id];
                    const isCorrect = selectedOption === q.correctIndex;

                    return (
                        <div key={q.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 transition-all">

                            <div className="flex gap-4 mb-6">
                                <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-black text-lg bg-indigo-50 text-indigo-600">
                                    {index + 1}
                                </div>
                                <h3 className="text-lg font-bold text-indigo-950 font-extrabold pt-1 leading-snug">
                                    {q.question}
                                </h3>
                            </div>

                            <div className="pl-0 md:pl-14 space-y-3">
                                {q.options.map((option, optIdx) => {
                                    const isSelected = selectedOption === optIdx;

                                    let optionStyle = "border-slate-200 hover:border-indigo-400 bg-white text-indigo-950 font-extrabold";
                                    let icon = null;

                                    if (isChecked) {
                                        if (optIdx === q.correctIndex) {
                                            optionStyle = "border-green-500 bg-green-50 text-green-800";
                                            icon = <CheckCircle2 size={20} className="text-green-600" />;
                                        } else if (isSelected && optIdx !== q.correctIndex) {
                                            optionStyle = "border-red-400 bg-red-50 text-red-700";
                                            icon = <XCircle size={20} className="text-red-500" />;
                                        } else {
                                            optionStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
                                        }
                                    } else if (isSelected) {
                                        optionStyle = "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600";
                                    }

                                    return (
                                        <button
                                            key={optIdx}
                                            onClick={() => handleSelect(q.id, optIdx)}
                                            disabled={isChecked}
                                            className={`w-full text-left px-5 py-3 rounded-xl border-2 font-semibold transition-all flex items-center justify-between ${optionStyle}`}
                                        >
                                            <span>
                                                <span className="mr-3 text-sm opacity-70">{String.fromCharCode(65 + optIdx)}.</span>
                                                {option}
                                            </span>
                                            {icon}
                                        </button>
                                    );
                                })}

                                <div className="pt-4 mt-2 border-t border-slate-100">
                                    {!isChecked ? (
                                        <button
                                            onClick={() => handleCheck(q.id)}
                                            disabled={selectedOption === undefined}
                                            className="px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Check Answer
                                        </button>
                                    ) : (
                                        <div className={`p-4 rounded-xl border flex gap-3 items-start ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <Lightbulb size={24} className={`flex-shrink-0 mt-0.5 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
                                            <div>
                                                <p className={`text-sm font-black uppercase tracking-wider mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                                </p>
                                                <p className={`text-sm font-medium leading-relaxed ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Results Summary */}
            {isComplete && (
                <div className="mt-8 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-10 shadow-xl text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <Trophy size={40} className="text-yellow-300" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Practice Complete!</h2>
                    <p className="text-white/80 text-lg font-medium mb-8">
                        You scored <span className="text-white font-bold">{correctCount}</span> out of <span className="text-white font-bold">{totalQuestions}</span> on <strong className="text-yellow-300">{activeTopic}</strong>
                        <span className="ml-2 px-2 py-1 bg-white/30 rounded-md text-white text-sm font-bold">
                            {Math.round((correctCount / totalQuestions) * 100)}%
                        </span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleRetake}
                            className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 transition-transform hover:scale-105 shadow-lg"
                        >
                            <RotateCcw size={20} /> Restart Session
                        </button>
                        <button
                            onClick={handleExit}
                            className="px-6 py-3 bg-indigo-800 text-white border border-indigo-500 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg"
                        >
                            <Search size={20} /> New Topic
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}