import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
//Creating the dynamo table
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
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
  }
}
