import { geminiConfigured } from "../config";
import { geminiAdapter } from "./gemini";
import { mockAdapter } from "./mock";
import type { AIAdapter } from "./types";

export function getAI(): AIAdapter {
  return geminiConfigured ? geminiAdapter : mockAdapter;
}

export type { AIAdapter } from "./types";
