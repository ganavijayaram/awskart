exports.handler = async function(event) {
    console.log("request: ", JSON.stringify(event, undefined, 2))

    return {
        statusCode: 200,
        header: {"Content-type": "text/plain"},
        body: `Hello from ordering microservice "${event.path}"\n`
    }
}