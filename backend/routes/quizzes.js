const express = require("express");
const router  = express.Router({ mergeParams: true }); // gets :slug and :index from parent
const { Course, Module, Quiz } = require("../models");

function requireAdmin(req, res, next) {
  if (req.headers["x-role"] !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Helper — find module by course slug + order index
async function findModule(slug, index) {
  const course = await Course.findOne({ where: { slug } });
  if (!course) return null;
  return Module.findOne({ where: { courseId: course.id, order: Number(index) } });
}

// Serialize a quiz question — strip correctIndex for students, include for admin
function serializeQuiz(q, includeAnswer = false) {
  const base = {
    id:       q.id,
    question: q.question,
    options:  q.options,
    explanation: q.explanation || null
  };
  if (includeAnswer) base.correctIndex = q.correctIndex;
  return base;
}

// GET /api/courses/:slug/modules/:index/quiz
// Returns questions without correct answers (students use this)
router.get("/", async (req, res) => {
  try {
    const mod = await findModule(req.params.slug, req.params.index);
    if (!mod) return res.status(404).json({ error: "Module not found" });

    const questions = await Quiz.findAll({
      where: { moduleId: mod.id },
      order: [["id", "ASC"]]
    });
    res.json(questions.map(q => serializeQuiz(q, false)));
  } catch (err) {
    res.status(500).json({ error: "Failed to load quiz" });
  }
});

// POST /api/courses/:slug/modules/:index/quiz/check
// Body: { answers: [0, 2, 1, ...] }  — student submits answers, gets back score + correct answers
router.post("/check", async (req, res) => {
  try {
    const mod = await findModule(req.params.slug, req.params.index);
    if (!mod) return res.status(404).json({ error: "Module not found" });

    const questions = await Quiz.findAll({
      where: { moduleId: mod.id },
      order: [["id", "ASC"]]
    });

    const { answers } = req.body; // array of chosen indices
    if (!Array.isArray(answers)) return res.status(400).json({ error: "answers must be an array" });

    const results = questions.map((q, i) => ({
      id:           q.id,
      question:     q.question,
      options:      q.options,
      correctIndex: q.correctIndex,
      explanation:  q.explanation || null,
      chosen:       answers[i] ?? null,
      correct:      answers[i] === q.correctIndex
    }));

    const score = results.filter(r => r.correct).length;
    res.json({ score, total: questions.length, passed: score / questions.length >= 0.6, results });
  } catch (err) {
    res.status(500).json({ error: "Failed to check answers" });
  }
});

// GET /api/courses/:slug/modules/:index/quiz/admin
// Returns questions WITH correct answers (admin only)
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const mod = await findModule(req.params.slug, req.params.index);
    if (!mod) return res.status(404).json({ error: "Module not found" });

    const questions = await Quiz.findAll({
      where: { moduleId: mod.id },
      order: [["id", "ASC"]]
    });
    res.json(questions.map(q => serializeQuiz(q, true)));
  } catch (err) {
    res.status(500).json({ error: "Failed to load quiz" });
  }
});

// POST /api/courses/:slug/modules/:index/quiz — add a question (admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const mod = await findModule(req.params.slug, req.params.index);
    if (!mod) return res.status(404).json({ error: "Module not found" });

    const { question, options, correctIndex, explanation } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2 || correctIndex == null) {
      return res.status(400).json({ error: "question, options (array ≥2), and correctIndex are required" });
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      return res.status(400).json({ error: "correctIndex out of range" });
    }

    const q = await Quiz.create({ moduleId: mod.id, question, options, correctIndex, explanation: explanation || null });
    res.status(201).json(serializeQuiz(q, true));
  } catch (err) {
    res.status(500).json({ error: "Failed to add question" });
  }
});

// PUT /api/courses/:slug/modules/:index/quiz/:qid — edit a question (admin)
router.put("/:qid", requireAdmin, async (req, res) => {
  try {
    const q = await Quiz.findByPk(req.params.qid);
    if (!q) return res.status(404).json({ error: "Question not found" });

    const { question, options, correctIndex, explanation } = req.body;
    await q.update({
      ...(question      !== undefined && { question }),
      ...(options       !== undefined && { options }),
      ...(correctIndex  !== undefined && { correctIndex }),
      ...(explanation   !== undefined && { explanation })
    });
    res.json(serializeQuiz(q, true));
  } catch (err) {
    res.status(500).json({ error: "Failed to update question" });
  }
});

// DELETE /api/courses/:slug/modules/:index/quiz/:qid — delete a question (admin)
router.delete("/:qid", requireAdmin, async (req, res) => {
  try {
    const q = await Quiz.findByPk(req.params.qid);
    if (!q) return res.status(404).json({ error: "Question not found" });
    await q.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

module.exports = router;
