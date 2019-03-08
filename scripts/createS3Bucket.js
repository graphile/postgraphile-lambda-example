const aws = require('aws-sdk');
const s3 = new aws.S3();

const bucketName = process.env.AWS_SERVICE_NAME;

async function main() {
  const { Buckets } = await s3.listBuckets().promise();

  if (Buckets.find(bucket => bucket.Name === bucketName)) {
    console.log(`Bucket "${bucketName}" already exists.`);
  } else {
    const bucketParams = {
      Bucket: bucketName
    };

    await s3.createBucket(bucketParams).promise();
    console.log(`Bucket "${bucketName}" created.`);
  }
};

main().catch(err => {
  console.log('Error', err);
  process.exit(1);
});
