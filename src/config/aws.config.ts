export default () => ({
  aws: {
    region: process.env.AWS_REGION!,
    s3Bucket: process.env.AWS_S3_BUCKET!,
  },
})