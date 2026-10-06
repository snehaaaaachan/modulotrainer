const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// One row = one student has completed one module in one course.
// Toggling a module on/off means inserting or deleting a row here.
const Progress = sequelize.define(
  "Progress",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.STRING(64), allowNull: false, field: "student_id" },
    courseSlug: { type: DataTypes.STRING(64), allowNull: false, field: "course_slug" },
    moduleOrder: { type: DataTypes.INTEGER, allowNull: false, field: "module_order" }
  },
  {
    tableName: "progress",
    timestamps: true,
    indexes: [{ unique: true, fields: ["student_id", "course_slug", "module_order"] }]
  }
);

module.exports = Progress;
