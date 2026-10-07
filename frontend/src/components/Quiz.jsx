import React, { useEffect, useState } from "react";
import { fetchQuiz, submitQuiz } from "../api";

export default function Quiz({ courseSlug, moduleIndex, onPassed }) {
  const [questions, setQuestions] = useState(null);
  const [answers,   setAnswers]   = useState([]);
  const [result,    setResult]    = useState(null); // {score,total,passed,results}
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);
  const [err,       setErr]       = useState("");

  useEffect(() => {
    setLoading(true); setErr(""); setResult(null);
    fetchQuiz(courseSlug, moduleIndex)
      .then(qs => { setQuestions(qs); setAnswers(new Array(qs.length).fill(null)); })
      .catch(e  => setErr(e.message))
      .finally(() => setLoading(false));
  }, [courseSlug, moduleIndex]);

  async function handleSubmit() {
    if (answers.some(a => a === null)) { setErr("Please answer all questions before submitting."); return; }
    setSubmitting(true); setErr("");
    try {
      const res = await submitQuiz(courseSlug, moduleIndex, answers);
      setResult(res);
      if (res.passed) onPassed?.();
    } catch (e) { setErr(e.message); }
    finally { setSubmitting(false); }
  }

  function handleRetry() { setResult(null); setAnswers(new Array(questions.length).fill(null)); }

  if (loading) return <div className="mt-4 text-xs text-muted animate-pulse">Loading quiz…</div>;
  if (err && !questions) return <div className="mt-4 text-xs text-red-500">{err}</div>;
  if (!questions || questions.length === 0) return null;

  // ── Results view ──
  if (result) {
    return (
      <div className="mt-4 rounded-xl border border-line bg-paperRaised p-4">
        <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${result.passed ? "bg-forest/10 border border-forest/30" : "bg-red-50 border border-red-200"}`}>
          <span className={`text-2xl font-bold font-display ${result.passed ? "text-forestDeep" : "text-red-600"}`}>
            {result.score}/{result.total}
          </span>
          <div>
            <p className={`text-sm font-semibold ${result.passed ? "text-forestDeep" : "text-red-600"}`}>
              {result.passed ? "✓ Passed!" : "✗ Not quite"}
            </p>
            <p className="text-xs text-muted">
              {result.passed ? "You scored ≥60% — well done." : "You need 60% to pass. Try again!"}
            </p>
          </div>
          {!result.passed && (
            <button onClick={handleRetry}
              className="ml-auto px-3.5 py-1.5 rounded-full border border-line text-xs font-medium hover:border-ink transition">
              Retry
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {result.results.map((r, i) => (
            <div key={r.id} className={`rounded-lg border p-3 text-[13px] ${r.correct ? "border-forest/30 bg-forest/5" : "border-red-200 bg-red-50"}`}>
              <p className="font-semibold text-ink mb-2">{i + 1}. {r.question}</p>
              <div className="flex flex-col gap-1">
                {r.options.map((opt, oi) => {
                  const isCorrect = oi === r.correctIndex;
                  const isChosen  = oi === r.chosen;
                  return (
                    <div key={oi} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                      isCorrect ? "bg-forest text-white font-medium" :
                      isChosen && !isCorrect ? "bg-red-400 text-white" :
                      "bg-paper text-inkSoft border border-line"
                    }`}>
                      <span className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                        style={{ borderColor: isCorrect ? "white" : isChosen ? "white" : "#D3DBD1" }}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                      {isCorrect && <span className="ml-auto">✓</span>}
                      {isChosen && !isCorrect && <span className="ml-auto">✗</span>}
                    </div>
                  );
                })}
              </div>
              {r.explanation && (
                <p className="mt-2 text-xs text-muted italic border-t border-line/50 pt-2">{r.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Question view ──
  return (
    <div className="mt-4 rounded-xl border border-line bg-paperRaised p-4">
      <div className="flex items-center gap-2 mb-4">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="#2F6F4E" strokeWidth="1.3"/>
          <path d="M6.5 6.5C6.5 5.67 7.17 5 8 5s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.5" stroke="#2F6F4E" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="8" cy="11" r=".6" fill="#2F6F4E"/>
        </svg>
        <span className="text-xs font-semibold text-forestDeep">Module Quiz — {questions.length} question{questions.length !== 1 ? "s" : ""}</span>
        <span className="ml-auto text-[11px] text-muted">Need 60% to pass</span>
      </div>

      <div className="flex flex-col gap-5">
        {questions.map((q, i) => (
          <div key={q.id}>
            <p className="text-sm font-semibold text-ink mb-2">{i + 1}. {q.question}</p>
            <div className="flex flex-col gap-1.5">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => { const a = [...answers]; a[i] = oi; setAnswers(a); }}
                  className={`text-left px-3.5 py-2 rounded-lg text-xs flex items-center gap-2.5 border transition ${
                    answers[i] === oi
                      ? "bg-forestDeep text-white border-forestDeep"
                      : "bg-paper text-inkSoft border-line hover:border-forest"
                  }`}>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                    answers[i] === oi ? "border-white text-white" : "border-line text-muted"
                  }`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {err && <p className="mt-3 text-xs text-red-500">{err}</p>}

      <button onClick={handleSubmit} disabled={submitting || answers.some(a => a === null)}
        className="mt-4 w-full py-2.5 rounded-lg bg-forestDeep text-white text-sm font-semibold hover:bg-forest transition disabled:opacity-40">
        {submitting ? "Checking…" : "Submit answers"}
      </button>
    </div>
  );
}
