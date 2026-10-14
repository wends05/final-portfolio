import z from "zod";

// allow specific extensions
export const allowedExtensions = z.enum(["jpg", "jpeg", "png", "webp"]);

export const MAX_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

export const bucket = "images";
