const express      = require("express");
const path         = require("path");
const fs           = require("fs");
const multer       = require("multer");
const router       = express.Router();
const { Course, Module } = require("../models");
const quizzesRouter = require("./quizzes");

const MATERIALS_DIR = path.join(__dirname, "..", "materials");

// ── Multer — store uploaded PDFs in materials/ ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MATERIALS_DIR),
  filename: (req, file, cb) => {
    // e.g. webdev-2.pdf  — deterministic so re-uploading replaces the old file
    const name = `${req.params.slug}-${req.params.index}.pdf`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  }
});

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

// GET /api/courses/:slug/modules/:index/pdf — stream PDF inline
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

// POST /api/courses — create a new course
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

// POST /api/courses/:slug/modules — add a module
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

    await Module.create({ courseId: course.id, order: nextOrder, title, time, body, pdfFile: null });

    const updated = await Course.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Module, as: "modules" }]
    });
    res.status(201).json(serializeCourse(updated));
  } catch (err) {
    res.status(500).json({ error: "Failed to add module" });
  }
});

// POST /api/courses/:slug/modules/:index/pdf — upload a PDF for a module
router.post("/:slug/modules/:index/pdf", requireAdmin, (req, res, next) => {
  upload.single("pdf")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    try {
      const course = await Course.findOne({ where: { slug: req.params.slug } });
      if (!course) return res.status(404).json({ error: "Course not found" });

      const order = Number(req.params.index);
      const courseModule = await Module.findOne({ where: { courseId: course.id, order } });
      if (!courseModule) return res.status(404).json({ error: "Module not found" });

      const fileName = `${req.params.slug}-${req.params.index}.pdf`;
      await courseModule.update({ pdfFile: fileName });

      const updated = await Course.findOne({
        where: { slug: req.params.slug },
        include: [{ model: Module, as: "modules" }]
      });
      res.json(serializeCourse(updated));
    } catch (e) {
      res.status(500).json({ error: "Failed to save PDF" });
    }
  });
});

// PUT /api/courses/:slug/modules/:index — edit a module
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

// DELETE /api/courses/:slug/modules/:index — remove a module
router.delete("/:slug/modules/:index", requireAdmin, async (req, res) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const order = Number(req.params.index);
    const courseModule = await Module.findOne({ where: { courseId: course.id, order } });
    if (!courseModule) return res.status(404).json({ error: "Module not found" });

    // Delete the PDF file if it exists
    if (courseModule.pdfFile) {
      const filePath = path.join(MATERIALS_DIR, courseModule.pdfFile);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await courseModule.destroy();

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

// Mount quiz routes — nested under /:slug/modules/:index/quiz
router.use("/:slug/modules/:index/quiz", quizzesRouter);

module.exports = router;
