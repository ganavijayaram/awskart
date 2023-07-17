import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EcommerceDatabase } from './database';
import { EcommerceMicroservices } from './microservice';
import { EcommerceApiGateway } from './apigateway';


export class CodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Defining the level-2 constructs 
    const database = new EcommerceDatabase(this, 'Database')
    const microservices = new EcommerceMicroservices(this, "Microservices", {
      productTable: database.productTable,
      basketTable: database.basketTable
    })
    const apigateway = new EcommerceApiGateway(this, "ApiGateway", {
      productMicroservice: microservices.productMicroservice
    })

  }
}
