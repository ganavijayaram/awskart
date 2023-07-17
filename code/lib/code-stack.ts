import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { LambdaRestApi, ResourceBase } from 'aws-cdk-lib/aws-apigateway';
//Creating the dynamo table
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime, RuntimeFamily } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { EcommerceDatabase } from './database';
import { EcommerceMicroservices } from './microservice';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new EcommerceDatabase(this, 'Database')
    const microservices = new EcommerceMicroservices(this, "Microservices", {
      productTable: database.productTable
    })

  

   


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
    handler: microservices.productMicroservice,
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
