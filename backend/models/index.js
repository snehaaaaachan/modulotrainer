const sequelize = require("../config/database");
const Course = require("./Course");
const Module = require("./Module");
const Progress = require("./Progress");

Course.hasMany(Module, { foreignKey: "courseId", as: "modules" });
Module.belongsTo(Course, { foreignKey: "courseId", as: "course" });

module.exports = { sequelize, Course, Module, Progress };
