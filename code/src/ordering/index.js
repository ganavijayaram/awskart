import { PutItemCommand, QueryCommand, ScanCommand} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient"

exports.handler = async function(event) {
    console.log("ORDERING request: ", JSON.stringify(event, undefined, 2))
    
    const eventType = event['detail-type']
    //if the event is coming from the SQS
    if(event.Records != null) {
      await sqsInvocation(event)
    }
    //Event is from the Event Bridge
    else if(eventType !== undefined) {
      await eventBridgeInvocation(event)
    }
    //Event is from the API gateway
    else {
      return await apiGatewayInvocation(event)
    }

}

const sqsInvocation = async (event) => {
  console.log(`sqsInvocation "${JSON.stringify(event)}"`)

  event.Records.forEach(async (record) => {
    console.log(`Record "${JSON.stringify(record)}"`)

   const recordBody =  JSON.parse(record.body)

   //Creating order from the detail part of the event
   await createOrder(recordBody.detail)
    
  });
}


const eventBridgeInvocation = async (event) => {

  await createOrder(event.detail)

}

const apiGatewayInvocation = async(event) => {

  //GET /order
  //GET /order/{userName}
  var body
  try {
    switch(event.httpMethod) {
      case "GET":
        if(event.pathParameters != null) {
          body = await getOrder(event)
        }
        else{
          body = await getAllOrders(event)
        }
        break
      default:
        throw new Error(`Unsupported http method {$event.httpMethod}`)
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success at apiGatewayInvocation",
        body: body
      })
    }
  }
  catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed in the apiGatewayInvocation",
        errorMsg: e.message,
        errorStack: e.stack
      })
    }
  }

}

const getOrder = async(event) => {
  console.log(`getOrder "${JSON.stringify.event}"`)

  const userName = event.pathParameters.userName
  const orderDate = event.queryStringParameters.orderDate

  const params = {
    //To get values from the db using botht he userName and orderDate
    KeyConditionExpression: "userName = :userName and orderDate = :orderDate",
      ExpressionAttributeValues: {
        ":userName": { S: userName },
        ":orderDate": { S: orderDate }
      },
      TableName: process.env.DYNAMO_TABLE_NAME
    };

  const {Items} = await ddbClient.send(new QueryCommand(params))

  console.log(Items)
  return Items.map((item) => unmarshall(item))
}

const getAllOrders = async(event) => {
  console.log(`getAllOrders "${JSON.stringify.event}"`)

  const params = {
    TableName: process.env.DYNAMO_TABLE_NAME,
  }

  const {Items} = await ddbClient.send(new ScanCommand(params))
  console.log(Items)
  return (Items) ? Items.map((item) => unmarshall(item)) : {}
}

const createOrder = async(event) => {
  console.log(`createOrder "${JSON.stringify.event}"`)
  try {
    const orderDate = new Date().toISOString();
    event.orderDate = orderDate
    console.log(`After adding order date "${JSON.stringify(event)}"`)

    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      Item: marshall(event || {})
    }

    const createOrderResult = await ddbClient.send(new PutItemCommand(params))
    console.log(`createOrdeRresult "${JSON.stringify(createOrderResult)}"`)
    return createOrderResult

  }
  catch (e){
    console.error(e)
    throw e
  }

  
}