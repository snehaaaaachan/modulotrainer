require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const { sequelize } = require("./models");

const coursesRouter  = require("./routes/courses");
const progressRouter = require("./routes/progress");
const quizzesRouter  = require("./routes/quizzes");

const app  = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/courses", coursesRouter);
app.use("/api/progress", progressRouter);
// Quiz routes are nested under course+module — mergeParams lets them read :slug and :index
app.use("/api/courses/:slug/modules/:index/quiz", quizzesRouter);

// One-time quiz seed endpoint — protected by a secret token
// Hit GET /api/seed-quizzes?token=modulotrainer_seed to seed quiz data
app.get("/api/seed-quizzes", async (req, res) => {
  if (req.query.token !== "modulotrainer_seed") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const { Course, Module, Quiz } = require("./models");
    const QUIZ_DATA = require("./seed_quizzes_data.json");
    let total = 0;
    const log = [];

    for (const [key, questions] of Object.entries(QUIZ_DATA)) {
      const lastDash   = key.lastIndexOf("-");
      const courseSlug = key.slice(0, lastDash);
      const order      = Number(key.slice(lastDash + 1));

      const course = await Course.findOne({ where: { slug: courseSlug } });
      if (!course) { log.push(`SKIP: course ${courseSlug} not found`); continue; }
      const mod = await Module.findOne({ where: { courseId: course.id, order } });
      if (!mod)    { log.push(`SKIP: ${courseSlug} module ${order} not found`); continue; }

      await Quiz.destroy({ where: { moduleId: mod.id } });
      for (const q of questions) {
        await Quiz.create({ moduleId: mod.id, question: q.question, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation });
        total++;
      }
      log.push(`OK: ${courseSlug}-${order} (${questions.length}q)`);
    }

    res.json({ seeded: total, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to MySQL");
    return sequelize.sync(); // auto-creates quizzes table too
  })
  .then(() => {
    app.listen(PORT, () => console.log(`ModuloTrainer API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MySQL connection error:", err.message);
    process.exit(1);
  });
