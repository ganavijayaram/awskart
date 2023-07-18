import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EcommerceDatabase } from './database';
import { EcommerceMicroservices } from './microservice';
import { EcommerceApiGateway } from './apigateway';
import { EcommerceEventbus } from './eventbus';


export class CodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Defining the level-2 constructs 
    const database = new EcommerceDatabase(this, 'Database')
    const microservices = new EcommerceMicroservices(this, "Microservices", {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable
    })
    const apigateway = new EcommerceApiGateway(this, "ApiGateway", {
      productMicroservice: microservices.productMicroservice,
      basketMicroservice: microservices.basketMicroservice,
      orderMicroservice: microservices.orderMicroservice
    })

    const eventBus = new EcommerceEventbus(this, 'Eventbus', {
      publisherFunction: microservices.basketMicroservice,
      targetFunction: microservices.orderMicroservice
    })

  }
}
