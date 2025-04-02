const { PutCommand, GetCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const geolib = require('geolib');

// Table name
const tableName = process.env.MESSAGES_TABLE || 'PostIt-Messages';

const Message = {
  // Create a new message
  async create(messageData) {
    const { content, latitude, longitude, user, username } = messageData;
    
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    const messageId = uuidv4();
    const timestamp = new Date().getTime();
    
    const messageItem = {
      messageId,
      userId: user, // This is the userId
      content,
      latitude,
      longitude,
      username,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const command = new PutCommand({
      TableName: tableName,
      Item: messageItem
    });
    
    await docClient.send(command);
    return messageItem;
  },
  
  // Find messages within a radius of a point
  async findNearby(latitude, longitude, radiusInMeters = 100) {
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    // Since DynamoDB doesn't support geospatial queries natively,
    // we'll need to retrieve potential messages and filter them
    
    // Get all messages from the last 24 hours (to limit results)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneDayAgoTimestamp = oneDayAgo.getTime();
    
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: 'createdAt >= :timeLimit',
      ExpressionAttributeValues: {
        ':timeLimit': oneDayAgoTimestamp
      }
    });
    
    const response = await docClient.send(command);
    
    // Filter messages by distance
    const nearbyMessages = response.Items.filter(message => {
      const distance = geolib.getDistance(
        { latitude, longitude },
        { latitude: message.latitude, longitude: message.longitude }
      );
      
      return distance <= radiusInMeters;
    });
    
    // Sort by most recent first
    return nearbyMessages.sort((a, b) => b.createdAt - a.createdAt);
  },
  
  // Find a message by ID
  async findById(messageId) {
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    const command = new GetCommand({
      TableName: tableName,
      Key: { messageId }
    });
    
    const response = await docClient.send(command);
    return response.Item;
  },
  
  // Delete a message
  async deleteOne(messageId) {
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    const command = new DeleteCommand({
      TableName: tableName,
      Key: { messageId }
    });
    
    await docClient.send(command);
    return { messageId };
  },
  
  // Find messages by user ID
  async findByUserId(userId) {
    const dynamoClient = global.dynamoClient;
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: 'UserMessages',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Sort descending (newest first)
    });
    
    const response = await docClient.send(command);
    return response.Items;
  }
};

module.exports = Message; 