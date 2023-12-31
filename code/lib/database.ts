import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class EcommerceDatabase extends Construct {

    //Exposing the product Table to the codestack
    public readonly productTable: ITable
    public readonly basketTable: ITable
    public readonly orderTable: ITable


    constructor (scope: Construct, id: string) {
        super(scope, id)

        
        //setting the value of the product variable which is being exposed
        this.productTable = this.createProductTable()
        //setting the value of the basket variable which is being exposed
        this.basketTable = this.createBasketTable()
        //setting the value of the order variable which is being exposed
        this.orderTable = this.createOrderTable()
    }

    private createProductTable(): ITable {
        //creating dynamo table for Product microservices
        //scope, id, properties
        //name, desc, image, category, price
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
        return productTable
    }

    private createBasketTable(): ITable {
         //creating dynamodb table for basket microservices
        //basket:  PK: username --items (SET-MAP)
        //eachItem - {productId, productName, price, color, quantity}
        const basketTable = new Table(this, 'basket', {
            partitionKey: {
              name: 'userName',
              type: AttributeType.STRING,
            },
            tableName: 'basket',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST
          });
          return basketTable;
    }

    //Creating table for order microservice
    //PK: userName SK: OrderDate totalPrice, firstName, lastName, email, address, paymentMethod, cardInfo
    private createOrderTable(): ITable {
        const orderTable = new Table(this, 'order', {
            partitionKey: {
                name: 'userName',
                type: AttributeType.STRING,
            },
            //we will have multiple orders underusername so we need to have sort key
            sortKey: {
                name: 'orderDate',
                type: AttributeType.STRING
            },
            tableName: 'order',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST
        })
        return orderTable
    }
}