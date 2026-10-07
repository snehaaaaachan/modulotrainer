import React, { useEffect, useState } from "react";
import { adminFetchQuiz, adminAddQuestion, adminEditQuestion, adminDeleteQuestion } from "../api";

const EMPTY_Q = { question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" };

function QuestionForm({ initial, onSave, onCancel }) {
  const [q,    setQ]    = useState(initial.question);
  const [opts, setOpts] = useState(initial.options.length >= 2 ? [...initial.options] : ["", "", "", ""]);
  const [ci,   setCi]   = useState(initial.correctIndex ?? 0);
  const [exp,  setExp]  = useState(initial.explanation || "");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  const cls = "w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-forest transition";

  async function handleSubmit(e) {
    e.preventDefault();
    const filledOpts = opts.filter(o => o.trim());
    if (!q.trim() || filledOpts.length < 2) { setErr("Question and at least 2 options required."); return; }
    if (ci >= filledOpts.length) { setErr("Correct answer index out of range."); return; }
    setBusy(true); setErr("");
    try {
      await onSave({ question: q.trim(), options: filledOpts, correctIndex: ci, explanation: exp.trim() || null });
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-paper border border-forest/30 rounded-xl p-3 mt-2">
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Question</label>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Enter question…" className={cls}/>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Options <span className="text-muted font-normal">(mark the correct one)</span></label>
        <div className="flex flex-col gap-1.5">
          {opts.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" checked={ci === i} onChange={() => setCi(i)}
                className="accent-forest flex-shrink-0"/>
              <input value={o} onChange={e => { const n=[...opts]; n[i]=e.target.value; setOpts(n); }}
                placeholder={`Option ${String.fromCharCode(65+i)}`} className={cls}/>
              {opts.length > 2 && (
                <button type="button" onClick={() => { const n=opts.filter((_,j)=>j!==i); setOpts(n); if(ci>=n.length) setCi(n.length-1); }}
                  className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">✕</button>
              )}
            </div>
          ))}
        </div>
        {opts.length < 6 && (
          <button type="button" onClick={() => setOpts([...opts, ""])}
            className="mt-1.5 text-xs text-forestDeep hover:underline">+ Add option</button>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Explanation <span className="text-muted font-normal">(optional, shown after answer)</span></label>
        <input value={exp} onChange={e => setExp(e.target.value)} placeholder="Why is this the correct answer?" className={cls}/>
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy}
          className="px-4 py-1.5 rounded-full bg-forestDeep text-white text-xs font-semibold hover:bg-forest transition disabled:opacity-50">
          {busy ? "Saving…" : "Save question"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-1.5 rounded-full border border-line text-xs hover:border-ink transition">Cancel</button>
      </div>
    </form>
  );
}

export default function QuizEditor({ courseSlug, moduleIndex }) {
  const [questions, setQuestions] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [err,       setErr]       = useState("");

  useEffect(() => {
    setLoading(true);
    adminFetchQuiz(courseSlug, moduleIndex)
      .then(setQuestions)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [courseSlug, moduleIndex]);

  async function handleAdd(data) {
    const q = await adminAddQuestion(courseSlug, moduleIndex, data);
    setQuestions(prev => [...(prev||[]), q]);
    setAdding(false);
  }

  async function handleEdit(qid, data) {
    const updated = await adminEditQuestion(courseSlug, moduleIndex, qid, data);
    setQuestions(prev => prev.map(q => q.id === qid ? updated : q));
    setEditingId(null);
  }

  async function handleDelete(qid) {
    if (!window.confirm("Delete this question?")) return;
    await adminDeleteQuestion(courseSlug, moduleIndex, qid);
    setQuestions(prev => prev.filter(q => q.id !== qid));
  }

  if (loading) return <div className="mt-3 text-xs text-muted animate-pulse">Loading quiz…</div>;

  return (
    <div className="mt-4 rounded-xl border border-amber/40 bg-amberSoft/10 p-3">
      <div className="flex items-center gap-2 mb-3">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="#C7902E" strokeWidth="1.3"/>
          <path d="M6.5 6.5C6.5 5.67 7.17 5 8 5s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.5" stroke="#C7902E" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="8" cy="11" r=".6" fill="#C7902E"/>
        </svg>
        <span className="text-xs font-semibold text-amber">Quiz Editor</span>
        <span className="ml-auto text-[11px] text-muted">{questions?.length || 0} question{questions?.length !== 1 ? "s" : ""}</span>
      </div>

      {err && <p className="text-xs text-red-500 mb-2">{err}</p>}

      <div className="flex flex-col gap-2">
        {questions?.map((q, i) => (
          <div key={q.id} className="bg-paperRaised border border-line rounded-lg p-3">
            {editingId === q.id ? (
              <QuestionForm
                initial={q}
                onSave={data => handleEdit(q.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink">{i+1}. {q.question}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {q.options.map((o, oi) => (
                      <span key={oi} className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        oi === q.correctIndex
                          ? "bg-forest text-white border-forest"
                          : "bg-paper text-muted border-line"
                      }`}>
                        {String.fromCharCode(65+oi)}: {o}
                      </span>
                    ))}
                  </div>
                  {q.explanation && <p className="mt-1 text-[11px] text-muted italic">{q.explanation}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setEditingId(q.id)}
                    className="px-2.5 py-1 rounded-lg border border-line text-[11px] hover:border-amber transition">Edit</button>
                  <button onClick={() => handleDelete(q.id)}
                    className="px-2.5 py-1 rounded-lg border border-line text-[11px] text-red-400 hover:border-red-400 transition">Del</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <QuestionForm initial={EMPTY_Q} onSave={handleAdd} onCancel={() => setAdding(false)} />
      ) : (
        <button onClick={() => setAdding(true)}
          className="mt-3 w-full py-2 rounded-lg border border-dashed border-amber/50 text-xs text-amber hover:border-amber hover:bg-amber/5 transition flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Add question
        </button>
      )}
    </div>
  );
}
