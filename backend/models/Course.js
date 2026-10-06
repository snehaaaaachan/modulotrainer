const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Course = sequelize.define(
  "Course",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    slug: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    domain: { type: DataTypes.STRING(64), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false }
  },
  {
    tableName: "courses",
    timestamps: true
  }
);

module.exports = Course;
