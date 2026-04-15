import multer from "multer";
import cloudinary from "../config/cloudinary.js";

import storagePkg from "multer-storage-cloudinary";

const CloudinaryStorage = storagePkg.CloudinaryStorage || storagePkg;

/* ---------- CATEGORY STORAGE ---------- */
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      {
        width: 600,
        height: 600,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
        dpr: "auto",
      },
    ],
  },
});

/* ---------- PRODUCT STORAGE ---------- */
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      {
        width: 1000,
        height: 1000,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
        dpr: "auto",
      },
    ],
  },
});

const categoryUpload = multer({ storage: categoryStorage });
const productUpload = multer({ storage: productStorage });

export const uploadSingle = categoryUpload.single("image");
export const uploadThree = productUpload.array("images", 3);
export const uploadFields = productUpload.fields([
  { name: "image0", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
]);
