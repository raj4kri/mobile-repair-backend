// // ================= CLOUDINARY =================
// const cloudinary = require("cloudinary").v2;
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_KEY,
//   api_secret: process.env.CLOUD_SECRET,
// });
// console.log(process.env.CLOUD_NAME);
// const uploadToCloudinary = (buffer, folder) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     );

//     stream.end(buffer);
//   });
// };
// module.exports = uploadToCloudinary;

const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadToCloudinary = async (fileBuffer) => {
  try {
    // ✅ COMPRESS IMAGE
    const compressedBuffer = await sharp(fileBuffer)
      .resize({ width: 1600 }) // optional resize
      .jpeg({ quality: 70 }) // compress
      .toBuffer();

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "deepak-communication",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        )
        .end(compressedBuffer);
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = uploadToCloudinary;