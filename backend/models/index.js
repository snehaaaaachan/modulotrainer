const sequelize = require("../config/database");
const Course    = require("./Course");
const Module    = require("./Module");
const Progress  = require("./Progress");
const Quiz      = require("./Quiz");

Course.hasMany(Module, { foreignKey: "courseId", as: "modules" });
Module.belongsTo(Course, { foreignKey: "courseId", as: "course" });

Module.hasMany(Quiz, { foreignKey: "moduleId", as: "quizzes" });
Quiz.belongsTo(Module, { foreignKey: "moduleId", as: "module" });

module.exports = { sequelize, Course, Module, Progress, Quiz };
