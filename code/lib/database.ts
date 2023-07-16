import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class EcommerceDatabase extends Construct {

    //Exposing the product Table
    public readonly productTable: ITable

    constructor (scope: Construct, id: string) {
        super(scope, id)

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
        //setting the value of the variable which is being exposed
        this.productTable = productTable
    }
}