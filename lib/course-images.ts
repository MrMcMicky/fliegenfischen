import { readdir } from "fs/promises";
import path from "path";

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

const collectImages = async (dir: string, publicPrefix: string) => {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) =>
        allowedExtensions.has(path.extname(name).toLowerCase())
      )
      .map((name) => `${publicPrefix}/${name}`);
  } catch {
    return [];
  }
};

export const getCourseImageOptions = async () => {
  const root = path.join(process.cwd(), "public", "illustrations");
  const courseDir = path.join(root, "courses");
  const [rootImages, courseImages] = await Promise.all([
    collectImages(root, "/illustrations"),
    collectImages(courseDir, "/illustrations/courses"),
  ]);

  return Array.from(new Set([...rootImages, ...courseImages])).sort();
};
