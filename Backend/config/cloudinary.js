import "dotenv/config";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

if (cloudinaryUrl) {
  cloudinary.config();
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  });
}

export const assertCloudinaryConfigured = () => {
  const cfg = cloudinary.config();
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env"
    );
  }
  return cfg.cloud_name;
};

const friendlyCloudinaryMessage = (error) => {
  const code = error?.http_code;
  if (code === 403) {
    return "Cloudinary upload forbidden — check API credentials and key permissions";
  }
  if (code === 401) {
    return "Cloudinary upload unauthorized — check API key and secret";
  }
  if (error?.name === "UnexpectedResponse" && code) {
    return `Cloudinary upload failed (HTTP ${code}) — verify credentials and account settings`;
  }
  return null;
};

export const isCloudinaryUploadError = (error) =>
  Boolean(
    error?.isCloudinaryUploadError ||
      error?.http_code === 401 ||
      error?.http_code === 403 ||
      error?.name === "UnexpectedResponse"
  );

const uploadDir = path.join(os.tmpdir(), "used-car-uploads");

const ensureUploadDir = async () => {
  await fs.mkdir(uploadDir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir()
      .then(() => cb(null, uploadDir))
      .catch((err) => cb(err));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

export const listingUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
}).fields([
  { name: "front", maxCount: 1 },
  { name: "rear", maxCount: 1 },
  { name: "leftSide", maxCount: 1 },
  { name: "rightSide", maxCount: 1 },
  { name: "interior", maxCount: 1 },
  { name: "dashboard", maxCount: 1 },
  { name: "odometer", maxCount: 1 },
  { name: "engine", maxCount: 1 },
  { name: "other", maxCount: 10 },
]);

const wrapCloudinaryError = (error) => {
  console.error("Cloudinary upload error:", error);
  const message = friendlyCloudinaryMessage(error);
  if (message) {
    const err = new Error(message);
    err.http_code = error.http_code;
    err.isCloudinaryUploadError = true;
    return err;
  }
  return error;
};

export const uploadImage = async (filePath, folder = "used-car-listings") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    throw wrapCloudinaryError(error);
  }
};

export const cleanupTempFiles = async (files) => {
  if (!files) return;

  const paths = Object.values(files)
    .flat()
    .map((file) => file?.path)
    .filter(Boolean);

  await Promise.all(
    paths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch {
        // ignore missing/already-removed temp files
      }
    })
  );
};

export const destroyImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // ignore cleanup failures
  }
};

export default cloudinary;
