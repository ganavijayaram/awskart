//Using thr EC6+
import { PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { validateHeaderValue } from "http";
import { GetItemCommand } from ("@aws-sdk/client-dynamodb");
import { marshall, unmarshall } from require("@aws-sdk/util-dynamodb");
import { ddbClient } from require("./ddbClient");

exports.handler = async function(event) {
    console.log("result:", JSON.stringify(event, undefined, 2));
    //Using switch to respond to various methods from the API gateway
    switch(event.httpMethod) {
        case "GET":
            if(event.pathParameters != null) {
                body = await getProduct(event.pathParameters.id); //GET /product/{id}
            }
            else {
                body = await getAllProducts(); //GET /product
            }
            break;
        case "POST":
            body = await createProduct(event)
            break;
        default:
            throw new Error(`Unsupported route: "${event.httpMethod}"`)
    }

    const getProduct = async(productId) => {
        console.log("getProduct")

        try {
            //Setting the parameters to query the table 
            const params = {
                TableName: process.env.DYNAMO_TABLE_NAME,
                Key: marshall({id: productId})
            }
            //Querying the table and waiting till we get the response using the DynamoDB API's 
            const {Item} = await ddbClient.send(new GetItemCommand(params))

            console.log(Item)

            //If the Item is not null, we will unmarshall it else we will send an empty json object
            return (Item) ? unmarshall(Item) : {}
        }
        catch (e){
            console.error(e)
            throw e
v
        }
    }

    const createProduct = async(event) => {
        console.log(`createProduct: "${event}" `)

        //Currently expecting body to have the follwoing parameters
        /*
        {
            id: value,
            name: value
        }*/

        try{
            const requestbody = JSON.parse(event.body)
            const params = {
                TableName:  process.env.DYNAMO_TABLE_NAME,
                Item: marshall(requestbody || {})
            }
            const result = await ddbClient.send(new PutItemCommand(params))

            console.log(result)

            return result
        }
        catch (e) {
            console.Error(e)
            throw e
        }

        

       
    }

    const getAllProducts =  async() => {
        console.log("getAllProducts")

        try {
            const {Item} = await ddbClient.send(new ScanCommand())
            return (Item) ? Item.map((item) => unmarshall(item)) : {}
        }
        catch(e) {
            console.error(e)
            throw e
        }
    }

    return {
        statusCode: 200,
        headers: {"Content-Type": "text/plain"},
        body: `Hello from the product microservices! You have hit ${event.path}\n`
    }
}