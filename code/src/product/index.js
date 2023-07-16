const { get } = require("http");

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
    return {
        statusCode: 200,
        headers: {"Content-Type": "text/plain"},
        body: `Hello from the product microservices! You have hit ${event.path}\n`
    }
}