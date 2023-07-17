//Using thr EC6+
import { GetItemCommand, DeleteItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";
import {v4 as uuidv4} from 'uuid'

exports.handler = async function(event) {
    console.log("result:", JSON.stringify(event, undefined, 2));

    try {
        var body
        //Using switch to respond to various methods from the API gateway
        switch(event.httpMethod) {
            case "GET":
                if(event.queryStringParameters != null) {
                    body = await getProductsByCategory(event);  //GET /product/{id}?category=phone
                }
                else if(event.pathParameters != null) {
                    body = await getProduct(event.pathParameters.id); //GET /product/{id}
                }
                else {
                    body = await getAllProducts(); //GET /product
                }
                break;
            case "POST":
                body = await createProduct(event)
                break;
            case "DELETE":
                body = await deleteProduct(event.pathParameters.id) //DELETE product/1
                break
            case "PUT":
                body = await updateProduct(event) //PUT /product/1
                break
            default:
                throw new Error(`Unsupported route: "${event.httpMethod}"`)
        }
        //console.log(`ERROR IN THE SWITCH "$body"`)
        return {
            statusCode: 200,
            body: JSON.stringify({
              message: `Successfully finished operation: "${event.httpMethod}"`,
              body: body
            })
          };
    }
    catch (e){
        console.error(e)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed in the handler Product Microservices",
                errorMsg: e.message,
                errorStack: e.stack
            })
        }
    }
}

const getAllProducts = async () => {
    console.log("getAllProducts");
    try {
      const params = {
        TableName: process.env.DYNAMO_TABLE_NAME
      };
  
      const { Items } = await ddbClient.send(new ScanCommand(params));
  
      console.log(Items);
      return (Items) ? Items.map((item) => unmarshall(item)) : {};
  
    } catch(e) {
      console.error(e);
      throw e;
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

const createProduct = async(event) => {
    console.log(`createProduct: "${event}" `)

    //Currently expecting body to have the follwoing parameters
    /*
    {
        id: value,
        name: value
    }*/


    try{
        const productRequest = JSON.parse(event.body)
        //Autogenerating the id
        const productId = uuidv4()
        //setting the product id into the body
        productRequest.id = productId
        const params = {
            TableName:  process.env.DYNAMO_TABLE_NAME,
            Item: marshall(productRequest || {})
        }
        const result = await ddbClient.send(new PutItemCommand(params))

        console.log(result)
        return result
    }
    catch (e) {
        console.error(e)
        throw e
    }
}



const deleteProduct = async (productId) => {
    console.log(`deleteProduct function. productId : "${productId}"`);
  
    try {
      const params = {
        TableName: process.env.DYNAMO_TABLE_NAME,
        Key: marshall({ id: productId }),
      };
  
      const deleteResult = await ddbClient.send(new DeleteItemCommand(params));
  
      console.log(deleteResult);
      return deleteResult;
    } catch(e) {
      console.error(e);
      throw e;
    }
  }

const updateProduct = async(event) => {
    console.log(`Updating the product "$event.pathParameters.id"`)

    try {
        const productRequest = JSON.parse(event.body)
        const objKeys = Object.keys(productRequest)
        console.log(`Update function requestBody "$productRequest" objKeys "$objKeys"` )
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: marshall({id: event.pathParameters.id}),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: productRequest[key],
            }), {})),
        }
        const result = await ddbClient.send(new UpdateItemCommand(params))

        console.log(result)
        return result  

    }
    catch (e) {
        console.error(e)
        throw e;
    }
}

const getProductsByCategory = async(event) => {
    console.log(`getProductByCategory "$event"`)
    try {

        const productId = event.pathParameters.id
        const category = event.queryStringParameters.category
        const params = {
            KeyConditionExpression: "id = :productId",
            FilterExpression: "contains (category, :category)",
            ExpressionAttributeValues: {
                ":productId": { S: productId },
                ":category": { S: category }
            },      
            TableName: process.env.DYNAMO_TABLE_NAME
            };
        
        const {Items} = await ddbClient.send(new QueryCommand(params))

        console.log(result)
        return (Items) ? Items.map((itme) => unmarshall(item)) : {}
    }
    catch (e) {
        console.error(e)
        throw e;
    }
}

    