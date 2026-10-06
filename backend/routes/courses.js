const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { Course, Module } = require("../models");

const MATERIALS_DIR = path.join(__dirname, "..", "materials");

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

// GET /api/courses - list all courses with their modules (catalog view)
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

// GET /api/courses/:slug - single course with its modules
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

// GET /api/courses/:slug/modules/:index/pdf - stream the module's reading PDF inline
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
    // "inline" lets the browser render it (e.g. in an <iframe>) instead of forcing a download
    res.setHeader("Content-Disposition", `inline; filename="${courseModule.pdfFile}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Failed to load module PDF" });
  }
});

module.exports = router;
