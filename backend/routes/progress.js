const express = require("express");
const router = express.Router();
const { Progress } = require("../models");

// GET /api/progress/:studentId - all progress for a student, grouped by course
// Response shape: [{ courseSlug, completedModules: [0, 2, 3] }, ...]
router.get("/:studentId", async (req, res) => {
  try {
    const rows = await Progress.findAll({ where: { studentId: req.params.studentId } });

    const byCourse = {};
    rows.forEach((row) => {
      if (!byCourse[row.courseSlug]) byCourse[row.courseSlug] = [];
      byCourse[row.courseSlug].push(row.moduleOrder);
    });

    const result = Object.keys(byCourse).map((courseSlug) => ({
      courseSlug,
      completedModules: byCourse[courseSlug].sort((a, b) => a - b)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to load progress" });
  }
});

// PUT /api/progress/:studentId/:courseSlug - toggle a module's completion
// body: { moduleIndex: number }
// Response shape: { completedModules: [0, 2, 3] }
router.put("/:studentId/:courseSlug", async (req, res) => {
  try {
    const { studentId, courseSlug } = req.params;
    const { moduleIndex } = req.body;
    if (typeof moduleIndex !== "number") {
      return res.status(400).json({ error: "moduleIndex must be a number" });
    }

    const existing = await Progress.findOne({
      where: { studentId, courseSlug, moduleOrder: moduleIndex }
    });

    if (existing) {
      await existing.destroy();
    } else {
      await Progress.create({ studentId, courseSlug, moduleOrder: moduleIndex });
    }

    const rows = await Progress.findAll({ where: { studentId, courseSlug } });
    const completedModules = rows.map((r) => r.moduleOrder).sort((a, b) => a - b);

    res.json({ completedModules });
  } catch (err) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

module.exports = router;
