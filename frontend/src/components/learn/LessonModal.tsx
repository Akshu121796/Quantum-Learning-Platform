import React, { useState } from 'react';
import type { LessonModule } from '../../types/quantum';
import { 
  X, 
  Play, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Lightbulb, 
  BookOpen,
  Award
} from 'lucide-react';

interface LessonModalProps {
  module: LessonModule;
  onClose: () => void;
  onTryInLab: (module: LessonModule) => void;
  onCompleteModule?: (moduleId: string, score: number) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  module,
  onClose,
  onTryInLab,
  onCompleteModule,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isMarkedCompleted, setIsMarkedCompleted] = useState(module.completed || module.progress === 100);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    module.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return { correct, total: module.quiz.length };
  };

  const score = calculateScore();

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const calculated = calculateScore();
    const percent = Math.round((calculated.correct / calculated.total) * 100);
    if (percent >= 50 && onCompleteModule) {
      onCompleteModule(module.id, percent);
      setIsMarkedCompleted(true);
    }
  };

  const handleManualComplete = () => {
    if (onCompleteModule) {
      onCompleteModule(module.id, 100);
      setIsMarkedCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
              Module {module.number}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">{module.title}</h2>
                {isMarkedCompleted && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Completed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{module.estimatedMinutes} min read</span>
                <span>•</span>
                <span className="capitalize">{module.difficulty} level</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 px-5 bg-white">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'content'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Concept & Theory</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'quiz'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Assessment ({module.quiz.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
          {activeTab === 'content' ? (
            <>
              {/* Summary */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs leading-relaxed text-slate-800 font-medium">
                  {module.summary}
                </p>
              </div>

              {/* Mathematical Formulation */}
              {module.latexSnippet && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Mathematical Formulation
                  </h4>
                  <div className="p-3 bg-slate-900 rounded-lg text-cyan-300 font-mono text-xs overflow-x-auto shadow-inner">
                    {module.latexSnippet}
                  </div>
                </div>
              )}

              {/* Key Concept Points */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                  Core Foundations
                </h4>
                <ul className="space-y-2">
                  {module.keyConcepts.map((concept, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 flex-shrink-0" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic Visual Explanation Section */}
              {module.visualExplanation ? (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      {module.visualExplanation.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Visual Explanation
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {module.visualExplanation.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {module.visualExplanation.steps.map((st, sIdx) => (
                      <div key={sIdx} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{st.label}</span>
                            {st.badge && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {st.badge}
                              </span>
                            )}
                          </div>
                          <div className="p-2 rounded bg-slate-50 border border-slate-100 font-mono font-bold text-xs text-slate-900 text-center">
                            {st.value}
                          </div>
                        </div>
                        {st.detail && (
                          <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                            {st.detail}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {module.visualExplanation.note && (
                    <div className="text-[11px] text-slate-600 bg-amber-50/80 border border-amber-200/80 rounded px-2.5 py-1.5 flex items-start gap-1.5">
                      <span className="text-amber-700 font-bold">Key Insight:</span>
                      <span>{module.visualExplanation.note}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    Visual Intuition
                  </h4>
                  <div className="flex items-center justify-around py-3 bg-white rounded border border-slate-200 font-mono text-xs">
                    <div className="text-center p-2">
                      <span className="text-[11px] text-slate-400 block mb-1">Input</span>
                      <span className="px-2 py-1 bg-slate-100 rounded font-bold text-slate-800">|0⟩</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="text-center p-2">
                      <span className="text-[11px] text-slate-400 block mb-1">Gate</span>
                      <span className="px-2 py-1 bg-slate-900 text-white rounded font-bold">Hadamard (H)</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="text-center p-2">
                      <span className="text-[11px] text-slate-400 block mb-1">Output</span>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold">
                        (|0⟩+|1⟩)/√2
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Assessment / Quiz View */
            <div className="space-y-6">
              {module.quiz.map((q, qIndex) => {
                const selected = selectedAnswers[q.id];

                return (
                  <div key={q.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                    <p className="text-xs font-semibold text-slate-900">
                      {qIndex + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => {
                        const isThisSelected = selected === optIndex;
                        let optionStyle = 'border-slate-200 hover:border-slate-400 bg-white text-slate-700';

                        if (quizSubmitted) {
                          if (optIndex === q.correctIndex) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                          } else if (isThisSelected) {
                            optionStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                          }
                        } else if (isThisSelected) {
                          optionStyle = 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            className={`w-full text-left p-2.5 rounded-md border text-xs transition-colors flex items-center justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIndex === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quiz Submit Bar */}
              <div className="pt-2 flex items-center justify-between">
                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(selectedAnswers).length < module.quiz.length}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Submit Assessment
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>
                        Score: {score.correct} / {score.total} (
                        {Math.round((score.correct / score.total) * 100)}%)
                      </span>
                      {score.correct === score.total && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          Mastery Passed!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isMarkedCompleted && (
                        <button
                          onClick={handleManualComplete}
                          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                        >
                          Mark as Completed
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setSelectedAnswers({});
                        }}
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setActiveTab(activeTab === 'content' ? 'quiz' : 'content')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            {activeTab === 'content' ? (
              <>
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Take Assessment ({module.quiz.length} questions)</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Back to Theory</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onTryInLab(module);
              onClose();
            }}
            className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Try it in Quantum Lab</span>
          </button>
        </div>
      </div>
    </div>
  );
};
