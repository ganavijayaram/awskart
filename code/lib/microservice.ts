import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

//TODO: To Accept parameters outside the class
interface EcommerceMicroservicesProps {
    productTable: ITable
}


export class EcommerceMicroservices extends Construct {

    //To allow other classes to be able to access these parameters
    public readonly productMicroservice: NodejsFunction

    constructor(scope: Construct, id: string, props: EcommerceMicroservicesProps) {
        super(scope, id)

        //Defining propertites for the nodejs Lamda function
        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
            //in this function if we need extrernal libraries we say aws-sdk
            externalModules: [
                'aws-sdk'
            ]
            },
            //TODO: give more explaination here
            environment: {
            PRIMARY_KEY: 'id',
            DYNAMO_TABLE_NAME: props.productTable.tableName
            },
            runtime: Runtime.NODEJS_18_X
        }

        //creating lambda function using the nodejs for bundling and packaging
        const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
            entry: join(__dirname, `/../src/product/index.js`),
            //using the properties defind above
            ...nodeJsFunctionProps
        })

        //giving permission to the lambda function to perform read and write operations on the product table
        props.productTable.grantReadWriteData(productFunction)
        this.productMicroservice = productFunction
    }

       
}