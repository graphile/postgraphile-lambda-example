const aws = require('aws-sdk');
const s3 = new aws.S3();

const bucketName = process.env.AWS_SERVICE_NAME;

s3.listBuckets((err, data) => {
  if (err) {
    console.log('Error', err);
    process.exit(1);
  }

  if (data.Buckets.find(bucket => bucket.Name === bucketName)) {
    console.log(`Bucket "${bucketName}" already exists.`);
  } else {
    const bucketParams = {
      Bucket: bucketName
    };

    s3.createBucket(bucketParams, (err, data) => {
      if (err) {
        console.log(`Bucket "${bucketName}" failed to build.`, err);
        process.exit(1);
      } else {
        console.log(`Bucket "${bucketName}" built in region ${data.Location}`);
      }
    });
  }
});
