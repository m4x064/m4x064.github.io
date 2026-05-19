#!/usr/bin/env node
"use strict";

const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

global.window = global;
require(path.join(rootDir, "src/data/stages.js"));
require(path.join(rootDir, "src/data/problems.js"));

const stages = global.MathFitStages;
const problems = global.MathFitProblems;
const errors = [];
const warnings = [];

if (!stages?.getStageConfigs) {
  errors.push("MathFitStages.getStageConfigs is missing.");
}

if (!problems) {
  errors.push("MathFitProblems is missing.");
}

const configs = stages?.getStageConfigs ? stages.getStageConfigs() : [];
const modeSet = new Set(configs.map((config) => config.mode));
const seenModes = new Set();
const seenButtonIds = new Set();
const rows = [];

configs.forEach((config) => {
  if (!config.mode) {
    errors.push("A stage config is missing mode.");
    return;
  }

  if (seenModes.has(config.mode)) {
    errors.push(`Duplicate stage mode: ${config.mode}`);
  }
  seenModes.add(config.mode);

  if (!config.title) {
    errors.push(`${config.mode}: title is missing.`);
  }

  if (config.buttonId) {
    if (seenButtonIds.has(config.buttonId)) {
      errors.push(`${config.mode}: duplicate buttonId ${config.buttonId}.`);
    }
    seenButtonIds.add(config.buttonId);
  }

  const pool = getProblemPool(config);
  const poolCount = pool ? pool.length : "";
  const declaredTotal = getDeclaredTotal(config, poolCount);
  const notes = [];

  if (config.usesDeck && !config.poolFactory && config.deckType !== "review") {
    errors.push(`${config.mode}: usesDeck is true but poolFactory/deckType is missing.`);
  }

  if (config.poolFactory && !pool) {
    errors.push(`${config.mode}: poolFactory ${config.poolFactory} was not found.`);
  }

  if (Array.isArray(pool)) {
    if (pool.length === 0) {
      warnings.push(`${config.mode}: generated problem pool is empty.`);
    }
    if (Number.isFinite(Number(config.expectedPoolSize)) && Number(config.expectedPoolSize) !== pool.length) {
      errors.push(`${config.mode}: expectedPoolSize ${config.expectedPoolSize} does not match generated pool size ${pool.length}.`);
    }
    validateProblems(config, pool);
  }

  if (config.deckType === "review") {
    const sources = Array.isArray(config.reviewSourceModes) ? config.reviewSourceModes : [];
    if (sources.length === 0) {
      errors.push(`${config.mode}: reviewSourceModes is empty.`);
    }
    sources.forEach((sourceMode) => {
      if (!modeSet.has(sourceMode)) {
        errors.push(`${config.mode}: review source ${sourceMode} is not a known stage.`);
      }
    });
    notes.push(`sources=${sources.join(",")}`);
  }

  if (config.trackProgress) {
    notes.push("progress");
  }

  if (config.timeLimitSeconds) {
    notes.push(`limit=${config.timeLimitSeconds}s`);
  }

  rows.push({
    mode: config.mode,
    title: config.title || "",
    total: declaredTotal,
    pool: poolCount,
    factory: config.poolFactory || config.deckType || "-",
    notes: notes.join("; "),
  });
});

printSummary(rows);

if (warnings.length > 0) {
  console.log("");
  console.log("Warnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length > 0) {
  console.log("");
  console.log("Errors:");
  errors.forEach((error) => console.log(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("");
  console.log("Stage summary check: OK");
}

function getProblemPool(config) {
  if (!config.poolFactory) {
    return null;
  }

  const factory = problems?.[config.poolFactory];
  if (typeof factory !== "function") {
    return null;
  }

  return factory();
}

function getDeclaredTotal(config, poolCount) {
  if (typeof config.questionTotal === "number") {
    return config.questionTotal;
  }

  if (config.questionTotal === "pool") {
    return poolCount || 0;
  }

  return "";
}

function validateProblems(config, pool) {
  pool.forEach((problem, index) => {
    const prefix = `${config.mode}[${index}]`;
    if (!problem.id) {
      errors.push(`${prefix}: id is missing.`);
    }
    if (!problem.text) {
      errors.push(`${prefix}: text is missing.`);
    }
    if (!problem.operation) {
      errors.push(`${prefix}: operation is missing.`);
    }
    if (!Number.isFinite(problem.answer)) {
      errors.push(`${prefix}: numeric answer is missing.`);
    }
    if (!Array.isArray(problem.tags) || problem.tags.length === 0) {
      warnings.push(`${prefix}: tags are missing.`);
    }
  });
}

function printSummary(summaryRows) {
  const columns = [
    ["mode", 18],
    ["title", 34],
    ["total", 7],
    ["pool", 7],
    ["factory", 36],
    ["notes", 120],
  ];

  console.log("Math Fit stage summary");
  console.log(columns.map(([name, width]) => name.padEnd(width)).join(" "));
  console.log(columns.map(([, width]) => "-".repeat(width)).join(" "));

  summaryRows.forEach((row) => {
    console.log(columns
      .map(([name, width]) => String(row[name] ?? "").slice(0, width).padEnd(width))
      .join(" "));
  });
}
