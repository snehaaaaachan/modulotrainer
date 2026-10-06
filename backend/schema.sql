-- Reference schema for ModuloTrainer on MySQL.
-- You do NOT need to run this by hand — `npm run dev` / `npm run seed` call
-- sequelize.sync(), which creates these tables automatically if they don't
-- exist yet. This file is here for anyone who prefers to create tables by
-- hand, or wants to see the shape of the data at a glance.

CREATE DATABASE IF NOT EXISTS modulotrainer;
USE modulotrainer;

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  domain VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  `order` INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  time VARCHAR(32) NOT NULL,
  body TEXT NOT NULL,
  pdf_file VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY uniq_course_order (course_id, `order`),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  course_slug VARCHAR(64) NOT NULL,
  module_order INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY uniq_student_course_module (student_id, course_slug, module_order)
);
