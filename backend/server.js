require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const coursesRouter = require("./routes/courses");
const progressRouter = require("./routes/progress");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/courses", coursesRouter);
app.use("/api/progress", progressRouter);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to MySQL");
    // Creates tables if they don't exist yet; safe for dev, use real migrations in production.
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => console.log(`ModuloTrainer API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MySQL connection error:", err.message);
    process.exit(1);
  });
