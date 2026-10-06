const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Module = sequelize.define(
  "Module",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.INTEGER, allowNull: false, field: "course_id" },
    order: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    time: { type: DataTypes.STRING(32), allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    pdfFile: { type: DataTypes.STRING(255), allowNull: true, field: "pdf_file" }
  },
  {
    tableName: "modules",
    timestamps: true,
    indexes: [{ unique: true, fields: ["course_id", "order"] }]
  }
);

module.exports = Module;
