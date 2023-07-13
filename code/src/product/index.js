exports.handler = async function(event) {
    console.log("result:", JSON.stringify(event, undefined, 2));
    return {
        statusCode: 200,
        headers: {"Content-Type": "text/plain"},
        body: `Hello from the product microservices! You have hit ${event.path}\n`
    }
}