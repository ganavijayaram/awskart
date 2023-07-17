import { GetItemCommand, DeleteItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient }  from "./ddbClient";

exports.handler = async function(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
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
    console.log("getBasket");
    try {
        const params = {
          TableName: process.env.DYNAMO_TABLE_NAME,
          Key: marshall({ userName: userName })
        };
     
        const { Item } = await ddbClient.send(new GetItemCommand(params));
    
        console.log(Item);
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
    console.log(`checkoutBasket "$event"`)
    //Once we checkout the basket, the event is sent to the Event Bridge and then the order microservice will sue it
    //this uses the concept of pub-sub model
    try {

    }
    catch (e){
        console.error(e)
        throw e
    }

}

//This is synchronous implementation
const createBasket = async(event) => {
    console.log(`createBasket "$event"`)

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

        console.log(createBasketResult)
        return createBasketResult

    }
    catch (e){
        console.error(e)
        throw e
    }

}

//This is synchronous implementation
const deleteBasket = async(userName) => {
    console.log(`deleteBasket "${userName}"`)

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