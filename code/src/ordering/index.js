import { PutItemCommand} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient"

exports.handler = async function(event) {
    console.log("ORDERING request: ", JSON.stringify(event, undefined, 2))
    
    const eventType = event['detail-type']
    if(eventType !== undefined) {
      await eventBridgeInvocation(event)
    }
    else {
      return await apiGatewayInvocation(event)
    }

}

const eventBridgeInvocation = async (event) => {

  await createOrder(event.detail)

}

const apiGatewayInvocation = async(event) => {

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