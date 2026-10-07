const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// One Quiz row = one question for a module.
// options is stored as JSON array of strings e.g. ["Paris","London","Berlin","Madrid"]
// correctIndex is 0-based index into options
const Quiz = sequelize.define(
  "Quiz",
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    moduleId:     { type: DataTypes.INTEGER, allowNull: false, field: "module_id" },
    question:     { type: DataTypes.TEXT,    allowNull: false },
    options:      { type: DataTypes.JSON,    allowNull: false },  // string[]
    correctIndex: { type: DataTypes.INTEGER, allowNull: false, field: "correct_index" },
    explanation:  { type: DataTypes.TEXT,    allowNull: true }    // shown after answer
  },
  {
    tableName: "quizzes",
    timestamps: true,
  }
);

module.exports = Quiz;
