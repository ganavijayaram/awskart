 //Creating database connnections before lambda execution
 //This will reduce the cost
 import {DynamoDBClient} from "@aws-sdk/client-dynamodb"
 //Creatinf service Client for basket db
 const ddbClient = new DynamoDBClient
 export  {ddbClient}