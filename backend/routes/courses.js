const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { Course, Module } = require("../models");

const MATERIALS_DIR = path.join(__dirname, "..", "materials");

// ── Middleware ────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.headers["x-role"] !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// ── Serialiser ────────────────────────────────────────────────────────────────
function serializeCourse(course) {
  return {
    slug: course.slug,
    domain: course.domain,
    title: course.title,
    description: course.description,
    modules: course.modules
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        order: m.order,
        title: m.title,
        time: m.time,
        body: m.body,
        pdfFile: m.pdfFile
      }))
  };
}

// ── Public routes ─────────────────────────────────────────────────────────────

// GET /api/courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: Module, as: "modules" }],
      order: [["createdAt", "ASC"]]
    });
    res.json(courses.map(serializeCourse));
  } catch (err) {
    res.status(500).json({ error: "Failed to load courses" });
  }
});

// GET /api/courses/:slug
router.get("/:slug", async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Module, as: "modules" }]
    });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(serializeCourse(course));
  } catch (err) {
    res.status(500).json({ error: "Failed to load course" });
  }
});

// GET /api/courses/:slug/modules/:index/pdf
router.get("/:slug/modules/:index/pdf", async (req, res) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const order = Number(req.params.index);
    const courseModule = await Module.findOne({ where: { courseId: course.id, order } });
    if (!courseModule || !courseModule.pdfFile) {
      return res.status(404).json({ error: "No PDF for this module" });
    }

    const filePath = path.join(MATERIALS_DIR, courseModule.pdfFile);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "PDF file missing on server" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${courseModule.pdfFile}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Failed to load module PDF" });
  }
});

// ── Admin routes ──────────────────────────────────────────────────────────────

// POST /api/courses  — create a new course
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { slug, domain, title, description } = req.body;
    if (!slug || !domain || !title || !description) {
      return res.status(400).json({ error: "slug, domain, title and description are required" });
    }
    const course = await Course.create({ slug, domain, title, description });
    res.status(201).json({ slug: course.slug, domain: course.domain, title: course.title, description: course.description, modules: [] });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "A course with that slug already exists" });
    }
    res.status(500).json({ error: "Failed to create course" });
  }
});

// POST /api/courses/:slug/modules  — add a module to a course
router.post("/:slug/modules", requireAdmin, async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Module, as: "modules" }]
    });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const { title, time, body } = req.body;
    if (!title || !time || !body) {
      return res.status(400).json({ error: "title, time and body are required" });
    }

    const nextOrder = course.modules.length > 0
      ? Math.max(...course.modules.map((m) => m.order)) + 1
      : 0;

    await Module.create({
      courseId: course.id,
      order: nextOrder,
      title,
      time,
      body,
      pdfFile: null
    });

    // Re-fetch and return updated course
    const updated = await Course.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Module, as: "modules" }]
    });
    res.status(201).json(serializeCourse(updated));
  } catch (err) {
    res.status(500).json({ error: "Failed to add module" });
  }
});

// PUT /api/courses/:slug/modules/:index  — edit an existing module
router.put("/:slug/modules/:index", requireAdmin, async (req, res) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const order = Number(req.params.index);
    const courseModule = await Module.findOne({ where: { courseId: course.id, order } });
    if (!courseModule) return res.status(404).json({ error: "Module not found" });

    const { title, time, body } = req.body;
    await courseModule.update({
      ...(title !== undefined && { title }),
      ...(time  !== undefined && { time  }),
      ...(body  !== undefined && { body  })
    });

    const updated = await Course.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Module, as: "modules" }]
    });
    res.json(serializeCourse(updated));
  } catch (err) {
    res.status(500).json({ error: "Failed to update module" });
  }
});

// DELETE /api/courses/:slug/modules/:index  — remove a module
router.delete("/:slug/modules/:index", requireAdmin, async (req, res) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const order = Number(req.params.index);
    const courseModule = await Module.findOne({ where: { courseId: course.id, order } });
    if (!courseModule) return res.status(404).json({ error: "Module not found" });

    await courseModule.destroy();

    // Re-number remaining modules so order stays gapless
    const remaining = await Module.findAll({
      where: { courseId: course.id },
      order: [["order", "ASC"]]
    });
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].order !== i) await remaining[i].update({ order: i });
    }

    const updated = await Course.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Module, as: "modules" }]
    });
    res.json(serializeCourse(updated));
  } catch (err) {
    res.status(500).json({ error: "Failed to delete module" });
  }
});

module.exports = router;
