require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, Course, Module } = require("./models");

// materials-data.json is the single source of truth, shared with generate_materials.py
const rawCourses = JSON.parse(
  fs.readFileSync(path.join(__dirname, "materials-data.json"), "utf-8")
);

async function run() {
  await sequelize.authenticate();
  console.log("Connected to MySQL. Syncing tables...");
  await sequelize.sync();

  for (const c of rawCourses) {
    const [course] = await Course.upsert(
      {
        slug: c.slug,
        domain: c.domain,
        title: c.title,
        description: c.description
      },
      { returning: true }
    );

    // upsert() doesn't always return the row consistently across dialects, so re-fetch to be safe
    const courseRow = await Course.findOne({ where: { slug: c.slug } });

    for (let index = 0; index < c.modules.length; index++) {
      const m = c.modules[index];
      await Module.upsert({
        courseId: courseRow.id,
        order: index,
        title: m.title,
        time: m.time,
        body: m.body,
        pdfFile: `${c.slug}-${index}.pdf`
      });
    }

    console.log("Upserted:", c.title, `(${c.modules.length} modules)`);
  }

  console.log("Done.");
  await sequelize.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
