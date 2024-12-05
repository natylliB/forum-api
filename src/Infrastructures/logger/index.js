/* istanbul ignore files */

const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const isTestEnv = process.env.NODE_ENV === 'test';

const cloudWatchConfig = {
  logGroupName: 'Forum-Api-Log-Group',
  logStreamName: 'Forum-Api-Log-Stream',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKeyId: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  messageFormatter: ({ level, message }) => `[${ level }] : ${message}`,
};

if(!isTestEnv) {
  winston.add(new WinstonCloudWatch(cloudWatchConfig));
} else {
  winston.add(new winston.transports.Console({ 
    format: winston.format.simple(),
  }));
}

module.exports = winston;