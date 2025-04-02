const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Table name
const tableName = process.env.USERS_TABLE || 'PostIt-Users';

const User = {
  // Create a new user
  async create(userData) {
    const { username, password } = userData;
    
    // Get DynamoDB client
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    // Check if user already exists
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userId = uuidv4();
    const timestamp = new Date().getTime();
    
    const userItem = {
      userId,
      username,
      password: hashedPassword,
      profilePicture: userData.profilePicture || '',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const command = new PutCommand({
      TableName: tableName,
      Item: userItem,
      ConditionExpression: 'attribute_not_exists(userId)'
    });
    
    await docClient.send(command);
    return userItem;
  },
  
  // Find a user by userId
  async findById(userId) {
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    const command = new GetCommand({
      TableName: tableName,
      Key: { userId }
    });
    
    const response = await docClient.send(command);
    return response.Item;
  },
  
  // Find a user by username
  async findByUsername(username) {
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    });
    
    const response = await docClient.send(command);
    return response.Items && response.Items.length > 0 ? response.Items[0] : null;
  },
  
  // Update a user
  async update(userId, updateData) {
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    const timestamp = new Date().getTime();
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':updatedAt': timestamp
    };
    
    // Build update expression and values
    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== 'userId') {
        updateExpression += `, ${key} = :${key}`;
        expressionAttributeValues[`:${key}`] = value;
      }
    });
    
    const command = new UpdateCommand({
      TableName: tableName,
      Key: { userId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });
    
    const response = await docClient.send(command);
    return response.Attributes;
  },
  
  // Compare password
  async matchPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },
  
  // Hash password for updates
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
};

module.exports = User; 