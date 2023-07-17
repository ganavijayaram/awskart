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
                body = await deleteBasket(event) //DELETE /basket/{userName}
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