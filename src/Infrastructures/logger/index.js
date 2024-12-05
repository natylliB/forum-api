/* istanbul ignore files */

const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const cloudWatchConfig = {
  logGroupName: 'Forum-Api-Log-Group',
  logStreamName: 'Forum-Api-Log-Stream',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKeyId: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  messageFormatter: ({ level, message }) => `[${ level }] : ${message}`,
};

winston.add(new WinstonCloudWatch(cloudWatchConfig));

module.exports = winston;