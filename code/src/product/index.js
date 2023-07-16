//Using thr EC6+
import { ScanCommand } from "@aws-sdk/client-dynamodb";
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