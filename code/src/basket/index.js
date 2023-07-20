import { GetItemCommand, DeleteItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient }  from "./ddbClient";
import { ebClient } from "./eventBridgeClient";

exports.handler = async function(event) {
    console.log("BASKET request:", JSON.stringify(event, undefined, 2));
    try {
        //based on the method we perform the operations
        //GET /basket
        //POST /basket

        //resource name = basket/{userName}

        //GET /basket/{userName}
        //POST /basket/checkout
        //DELETE /basket/{userName}
        var body
        switch(event.httpMethod) {
            case "GET":
                if(event.pathParameters != null) {
                    body = await getBasket(event.pathParameters.userName) ///GET /basket/{userName}
                }
                else {
                    body =  await getAllBasket() //GET /basket
                }
                break
            case "POST":
                if(event.path == "/basket/checkout") {
                    body = await checkoutBasket(event)    //POST /basket/checkout
                }
                else {
                    body = await createBasket(event)   //POST /basket
                }
                break
            case "DELETE":  
                body = await deleteBasket(event.pathParameters.userName) //DELETE /basket/{userName}
                break
            default:
                throw new Error(`Unsupported route ${event.httpMethod}`)
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully completed the operation for path "${event.path}"`,
                body: body
            })
           
        }
    }
    catch (e){
        console.error(e)
        return {
            statusCode: 500,
            message: "Failed in the handler of Basket Microservices",
                errorMsg: e.message,
                errorStack: e.stack
        }
    }
}  

//This is synchronous implementation
const getBasket = async (userName) => {
    console.log(`getBasket "${userName}"`);
    try {
        const params = {
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: marshall({ userName: userName })
        };

        console.log("GETBASKET BEFORE")
     
        const { Item } = await ddbClient.send(new GetItemCommand(params))
    
        console.log(`Item is "${JSON.stringify(Item)}"`);
        console.log("GETBASKET AFTER")
        return (Item) ? unmarshall(Item) : {};
    
      } catch(e) {
        console.error(e);
        throw e;
    }
  }

//This is synchronous implementation
const getAllBasket = async() => {
    console.log("getAllBasket")

    try {
        const params =  {
            TableName: process.env.DYNAMO_TABLE_NAME
        }

        const {Items} =  await ddbClient.send(new ScanCommand(params))

        console.log(Items)
        return (Items)? Items.map((item) => unmarshall(item)): {}
    }
    catch (e){
        console.error(e)
        throw e
    }

}

//This is asynchronous implementation
const checkoutBasket = async(event) => {
    console.log(`checkoutBasket "${JSON.stringify(event)}"`)
    //Once we checkout the basket, the event is sent to the Event Bridge and then the order microservice will sue it
    //this uses the concept of pub-sub model

    //expected payload: {userName: xyz, attributes[firstname, lastName]}
    //Extracting the payload
    const eventBody = JSON.parse(event.body)

    if(eventBody == null || eventBody.userName == null) {
        throw new Error('userName not present in the event "${eventbody}"')
    }

    //get items from the basket for that user
    const userBasket = await getBasket(eventBody.userName)

    //create even with this items and calculate the totalprice
    const eventPayload = preparePayload(eventBody, userBasket)
   

    //publish event to the event bridge
    const publishedEvent = await publishCheckoutBasketEvent(eventPayload)

    //remove the existing basket
    await deleteBasket(eventBody.userName)
    
    try {

    }
    catch (e){
        console.error(e)
        throw e
    }

}

const preparePayload = (eventBody, userBasket) => {
    console.log(`preparePayload eventBody "${JSON.stringify(eventBody)}" userBasket "${JSON.stringify(userBasket)}"`)
    try {
        //Items should be present in the userBasket
        if(userBasket == null || userBasket.items == null) {
            throw new Error(`Basket has no items "${JSON.stringify(userBasket)}"`)
        }
        let totalAmount = 0
        console.log(`userBaskets items "${JSON.stringify(userBasket.items)}"`)
        userBasket.items.forEach(item => totalAmount = totalAmount + item.price);
        eventBody.totalPrice = totalAmount
        console.log(`eventBody after Amount is "${JSON.stringify(eventBody)}"`)

        //Copying items from userBasket to the eventBody
        Object.assign(eventBody, userBasket)
        console.log(`Successfully prepared the payload "${JSON.stringify(eventBody)}"`)
        return eventBody

    }
    catch (e) {
        console.error(e)
        throw e
    }
}

const publishCheckoutBasketEvent = async (eventPayload) => {
    console.log(`publishCheckoutBasketEvent event Payload "${JSON.stringify(eventPayload)}"`)

    try {
        const params = {
            Entries: [
                {
                    Source: process.env.EVENT_SOURCE,
                    Detail: JSON.stringify(eventPayload),
                    DetailType: process.env.EVENT_DETAIL_TYPE,
                    Resources: [],
                    EventBusName: process.env.EVENT_BUS_NAME
                },
            ],
        }

        //Publishing event to the Event bridge
        const checkOutResult = await ebClient.send(new PutEventsCommand(params))

        console.log(`Successfully send the event "${JSON.stringify(checkOutResult)}"`)
        return checkOutResult

    }
    catch (e) {
        console.error(e)
        throw e
    }
}

//This is synchronous implementation
const createBasket = async(event) => {
    console.log(`createBasket "${JSON.stringify(event)}"`)

    try {
        const requestBody = JSON.parse(event.body)
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            //retrieving the parameters sent by the user and using it create basket
            //This item should conatin the minimum parameter of the 'userName' as described in the 
            //definition of the basketTable in the database.ts
            Item: marshall(requestBody || {})
        }

        const createBasketResult =  await ddbClient.send(new PutItemCommand(params))

        console.log(`Result "$JSON.stringify(createBasketResult)"`)
        return createBasketResult

    }
    catch (e){
        console.error(e)
        throw e
    }

}

//This is synchronous implementation
const deleteBasket = async(userName) => {
    console.log(`deleteBasket "${JSON.stringify(userName)}"`)

    try {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: marshall({userName: userName})
        }

        const deleteBasketResult = await ddbClient.send(new DeleteItemCommand(params))

        console.log(deleteBasketResult)
        return deleteBasketResult

    }
    catch (e){
        console.error(e)
        throw e
    }

}