const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(path.join(process.cwd(), "public", "images"), { recursive: true });
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileTypes = /jpeg|jpg|png|gif|webp/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        if (!extName && !mimeType) throw { status: 400, message: "فایل صحیح نیست" };

        const fileName = Date.now() + String(Math.random() * 9999);

        cb(null, fileName + ext);
    },
});

const uploader = multer({ storage });

module.exports = uploader;
