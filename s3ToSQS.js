'use strict';
/**
 * When any items are written to an S3 bucket, also write them to an SQS queue:
 */

const AWS = require('aws-sdk');

AWS.config.apiVersions = {
  s3: '2006-03-01',
  sns: '2010-03-31',
  sqs: '2012-11-05'
};

let s3 = new AWS.S3({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

let sns = new AWS.SNS({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

let sqs = new AWS.SQS({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


/**
 * Subscribe to a topic:
 *
 * If the subscription is an email that requires user confirmation then the
 * SubscriptionArn value will be 'pending confirmation'.
 */

let subscribeToTopic = (topicArn, protocol, endpoint) => {
  return sns.subscribe({
    TopicArn: topicArn,
    Protocol: protocol,
    Endpoint: endpoint
  })
  .promise()
  .then(data => {
    return Promise.resolve(data.SubscriptionArn);
  })
  ;
};

/**
 * Set the topic's access policy:
 *
 * Q: There seems to be a piece missing:
 *
 * "Condition": {
 *   "ArnLike": {
 *     "aws:SourceArn": "arn:aws:s3:*:*:bucket-name"
 *   }
 * }
 */

let setTopicAccessPolicy = topicArn => {
  return sns.addPermission({
    AWSAccountId: [ '*' ],
    ActionName: [ 'Publish' ],
    Label: 'New Policy ID',
    TopicArn: topicArn
  })
  .promise()
  ;
};

/**
 * Set the queue's access policy:
 */

let setSqsAccessPolicy = (queueUrl, queueArn) => {
  return sqs.setQueueAttributes({
    QueueUrl: queueUrl,
    Attributes: {
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Id: `${queueArn}/SQSDefaultPolicy`,
        Statement: {
          Effect: 'Allow',
          Principal: {
            AWS: '*'
          },
          Action: 'SQS:SendMessage',
          Resource: queueArn
        }
      })
    }
  })
  .promise()
  ;
};


/**
 * Set the bucket policy:
 */

let setBucketAccessPolicy = (bucketName, topicArn) => {
  let topicPolicy = {
    Version: '2008-10-17',
    Id: '__default_policy_ID',
    Statement: [
      {
        Sid: '__console_pub_0',
        Effect: 'Allow',
        Principal: {
          AWS: '*'
        },
        Action: [
          'SNS:Publish',
          'SNS:Subscribe'
        ],
        'Resource': topicArn
      }
    ]
  };

  s3.putBucketPolicy({
    Bucket: bucketName,
    Policy: JSON.stringify(topicPolicy)
  })
  .promise()
  ;
};

/**
 * Create notifications on the S3 bucket:
 */

let createS3Notifications = (bucketName, topicArn, folderName, fileName) => {
  let params = {
    Bucket: bucketName,
    NotificationConfiguration: {
      TopicConfigurations: [
        {
          Events: [ 's3:ObjectCreated:Put' ],
          TopicArn: topicArn,
          Filter: {
            Key: {
              FilterRules: [
                {
                  Name: 'prefix',
                  Value: folderName
                },
                {
                  Name: 'suffix',
                  Value: fileName
                }
              ]
            }
          }
        },
      ]
    }
  };

  return s3.putBucketNotificationConfiguration(params)
  .promise()
  ;
};

/**
 * Subscribe to changes on an S3 bucket:
 */

let createS3Topic = (topicName) => {
  return sns.createTopic({Name: topicName})
  .promise()
  .then(data => {
    return Promise.resolve(data.TopicArn);
  })
  ;
};

let topicName = process.env.RELAY_TOPIC_NAME;
let bucketName = process.env.RELAY_BUCKET_NAME;
let queueName = process.env.RELAY_QUEUE_NAME;
let folderName = process.env.RELAY_FOLDER_NAME;
let fileName = process.env.RELAY_FILE_NAME;
let customerId = process.env.RELAY_CUSTOMER_ID;
let defaultRegion = process.env.AWS_DEFAULT_REGION;
let queueArn = `arn:aws:sqs:${defaultRegion}:${customerId}:${queueName}`;

/**
 * [TODO]
 *
 * Get the queue URL from the SDK instead of constructing it:
 */

let queueUrl = `https://sqs.${defaultRegion}.amazonaws.com/${customerId}/${queueName}`

console.log('queueUrl:', queueUrl);
console.log('queueArn:', queueArn);

createS3Topic(topicName)
.then(topicArn => {
  return Promise.all([
    Promise.resolve(topicArn),
    setTopicAccessPolicy(topicArn),
    setSqsAccessPolicy(queueUrl, queueArn),
    setBucketAccessPolicy(bucketName, topicArn),
    createS3Notifications(bucketName, topicArn, folderName, fileName)
  ]);
})
.then(results => {
  console.log('Got the final results:', results);
  return subscribeToTopic(results[0], 'sqs', queueArn);
})
.catch(err => {
  console.error(err, err.stack);
})
;
