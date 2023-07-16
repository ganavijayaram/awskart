//Import SDK to crete DynamoDB Service Client Object
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const ddbClient = new DynamoDBClient();
export { ddbClient };