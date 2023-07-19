import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

//To Accept parameters outside the class, requestiong these values for creating the lambda functiosn
interface EcommerceMicroservicesProps {
    productTable: ITable,
    basketTable: ITable,
    orderTable: ITable
}

export class EcommerceMicroservices extends Construct {

    //To allow other classes to be able to access these parameters
    public readonly productMicroservice: NodejsFunction
    public readonly basketMicroservice: NodejsFunction
    public readonly orderMicroservice: NodejsFunction
    

    constructor(scope: Construct, id: string, props: EcommerceMicroservicesProps) {
        super(scope, id)

        //Exposing the product Function to other classes
        this.productMicroservice = this.createProductMicroservices(props.productTable)
        this.basketMicroservice = this.createBasketMicroservices(props.basketTable)
        this.orderMicroservice = this.createOrderMicroservice(props.orderTable)
    }

    private createProductMicroservices(productTable: ITable): NodejsFunction {
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
            DYNAMO_TABLE_NAME: productTable.tableName
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
        productTable.grantReadWriteData(productFunction)
        return productFunction
    }

    private createBasketMicroservices(basketTable: ITable): NodejsFunction {

        const basketFunctionProps: NodejsFunctionProps  = {
            bundling: {
                externalModules: [
                    'aws-sdk'
                ]
            },
            environment: {
                PRIMARY_KEY: 'userName',
                DYNAMO_TABLE_NAME: basketTable.tableName,
                EVENT_SOURCE: "com.ecommerce.basket.checkoutbasket",
                EVENT_DETAIL_TYPE: "CheckoutBasket",
                EVENT_BUS_NAME: "EventBus"
                 
            },
            runtime: Runtime.NODEJS_18_X
        }

        const basketFunction = new NodejsFunction(this, 'basketLambdaFunction', {
            entry: join(__dirname, `/../src/basket/index.js`),
            ...basketFunctionProps
        })

        basketTable.grantReadWriteData(basketFunction)
        return basketFunction

    }

    private createOrderMicroservice(orderTable: ITable): NodejsFunction {

        const orderFunctionProps: NodejsFunctionProps  = {
            bundling: {
                externalModules: [
                    'aws-sdk'
                ]
            },
            environment: {
                PRIMARY_KEY: 'userName',
                SORT_KEY: 'orderDate',
                DYNAMO_TABLE_NAME: orderTable.tableName
            },
            runtime: Runtime.NODEJS_18_X
        }

        const orderFunction = new NodejsFunction(this, 'orderLambdaFunction', {
            entry: join(__dirname, `/../src/ordering/index.js`),
            ...orderFunctionProps
        })

        orderTable.grantReadWriteData(orderFunction)
        return orderFunction
    }  
}