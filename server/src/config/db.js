const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');

const configureAWS = () => {
  try {
    const clientConfig = {
      region: process.env.AWS_REGION || 'eu-central-1'
    };
    
    // If we're in local development, use credentials from env vars
    if (process.env.NODE_ENV !== 'production') {
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        clientConfig.credentials = {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };
      }
    }
    
    // Create DynamoDB client
    const dynamoClient = new DynamoDBClient(clientConfig);
    
    // Create S3 client
    const s3Client = new S3Client(clientConfig);
    
    // Make clients globally available
    global.dynamoClient = dynamoClient;
    global.s3Client = s3Client;
    global.profileBucket = process.env.PROFILE_BUCKET || 'post-it-profile-pictures';
    
    // Verify DynamoDB connection
    const listTablesCommand = new ListTablesCommand({});
    dynamoClient.send(listTablesCommand)
      .then(data => {
        console.log('DynamoDB Connected. Available tables:', data.TableNames.join(', '));
      })
      .catch(err => {
        console.error('Error connecting to DynamoDB:', err);
      });
    
    console.log('S3 Client configured for bucket:', global.profileBucket);
    
  } catch (error) {
    console.error(`Error configuring AWS: ${error.message}`);
    process.exit(1);
  }
};

module.exports = configureAWS; 