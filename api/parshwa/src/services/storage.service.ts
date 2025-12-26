import * as AWS from "aws-sdk";
import config from "../config";
import multer from "multer";
import multerS3 from "multer-s3";
import * as path from "path";

if (!config.AWSBucket) {
  throw new Error("S3 config not set");
}

AWS.config.update({
  accessKeyId: config.AWSAccessKeyId,
  region: "localhost",
  secretAccessKey: config.AWSSecretKey,
});

let s3 = new AWS.S3({
  correctClockSkew: true,
  s3ForcePathStyle: true,
  endpoint: config.storageEndpoint,
});

let upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.AWSBucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req: any, file, cb) {
      cb(
        null,
        `media/${req.auth.uuid}/${Date.now().toString()}-${file.originalname}`
      );
    },
  }),
});

let imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.AWSBucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req: any, file, cb) {
      cb(
        null,
        `media/${req.auth.uuid}/${Date.now().toString()}-${file.originalname}`
      );
    },
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg")
      return callback(new Error("Only images are allowed"));
    callback(null, true);
  },
});

export { s3, upload, imageUpload };
