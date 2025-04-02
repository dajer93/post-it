const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

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
    
    // Make DynamoDB client globally available
    global.dynamoClient = dynamoClient;
    
    // Verify DynamoDB connection
    const listTablesCommand = new ListTablesCommand({});
    dynamoClient.send(listTablesCommand)
      .then(data => {
        console.log('DynamoDB Connected. Available tables:', data.TableNames.join(', '));
      })
      .catch(err => {
        console.error('Error connecting to DynamoDB:', err);
      });
    
  } catch (error) {
    console.error(`Error configuring AWS: ${error.message}`);
    process.exit(1);
  }
};

module.exports = configureAWS; 