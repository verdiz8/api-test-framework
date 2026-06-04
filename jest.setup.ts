// Jest setup — load environment variables from .env before tests run
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Ensure test-results directory exists for jest-junit (CI)
fs.mkdirSync("./test-results", { recursive: true });
