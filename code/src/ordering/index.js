exports.handler = async function(event) {
    console.log("ORDERING request: ", JSON.stringify(event, undefined, 2))
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello from Ordering ! You've hit ${event.path}\n`
      };	
}