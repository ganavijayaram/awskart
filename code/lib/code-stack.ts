import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { LambdaRestApi, ResourceBase } from 'aws-cdk-lib/aws-apigateway';
//Creating the dynamo table
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime, RuntimeFamily } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   //creating dynamo table
   //scope, id, properties
   const productTable = new Table(this, 'product', {
    //partiton key
    partitionKey: {
      name: 'id',
      type: AttributeType.STRING
    },
    //name of the table
    tableName: 'product',
    //to destroy when we run cdk destroy, else even if run cdk destroy, it will not destroy if we dont mention destroy
    removalPolicy: RemovalPolicy.DESTROY,
    billingMode: BillingMode.PAY_PER_REQUEST
   })

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


   //Creating infrastructure for the API gateway for microservices
   //root name = product
   //GET /product
   //POST /product

   //Single product with id parameter
   //GET /product/{id}
   //PUT /product/{id}
   //DELETE /product/{id}

  
   const apigw = new LambdaRestApi(this, 'productApi', {
    restApiName: 'Product Service',
    handler: productFunction,
    //Tells that we need to define our own resources and methods
    proxy: false
   });

  //creating resources and respective methods
   const product = apigw.root.addResource('product') // /product
   product.addMethod('GET') // GET /product
   product.addMethod('POST') //POST /product

   const singleProduct = product.addResource('{id}') // /product/{id}
   singleProduct.addMethod('GET'); //GET /product/{id}
   singleProduct.addMethod('DELETE'); //DELETE /product/{id}
   singleProduct.addMethod('PUT'); //PUT /product/{id}

  }
}
