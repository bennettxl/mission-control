import { promises as fs } from "node:fs";
import path from "node:path";

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}


export type DailyMemoryEntry = {
  date: string;
  label: string;
  content: string;
};

export async function loadDailyMemories(limit = 10): Promise<DailyMemoryEntry[]> {
  const memoryDir = path.resolve(process.cwd(), "..", "memory");

  try {
    if (!(await pathExists(memoryDir))) {
      return [];
    }
    const files = await fs.readdir(memoryDir);
    const dayFiles = files
      .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
      .sort()
      .reverse()
      .slice(0, limit);

    const formatter = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      weekday: "short",
    });

    const entries: DailyMemoryEntry[] = [];
    for (const file of dayFiles) {
      const raw = await fs.readFile(path.join(memoryDir, file), "utf-8");
      const iso = file.replace(".md", "");
      const dateObj = new Date(`${iso}T12:00:00`);
      entries.push({
        date: iso,
        label: formatter.format(dateObj),
        content: raw.trim(),
      });
    }
    return entries;
  } catch (error) {
    console.warn("loadDailyMemories failed", error);
    return [];
  }
}

export async function loadLongTermDirectives(): Promise<string[]> {
  const directivesPath = path.resolve(process.cwd(), "..", "MEMORY.md");
  try {
    if (!(await pathExists(directivesPath))) {
      return [];
    }
    const raw = await fs.readFile(directivesPath, "utf-8");
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.replace(/^-/u, "").trim());
  } catch (error) {
    console.warn("loadLongTermDirectives failed", error);
    return [];
  }
}
