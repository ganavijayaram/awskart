import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction, SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface EcommerceEventbusProps {
    publisherFunction: IFunction
    targetQueue: IQueue
}

export class EcommerceEventbus extends Construct {
    constructor(scope: Construct, id: string, props: EcommerceEventbusProps) {
        super(scope, id)

        //Creating custom event bus
        const eventBus = new EventBus(this, 'EventBus', {
            eventBusName: 'EventBus'
        })
    
        //Rule Creation
        const checkoutBasketRule = new Rule(this, 'CheckoutBasketRule', {
            eventBus: eventBus,
            enabled: true,
            description: 'Called when the basket microservice calls the checkout',
            //checks if the following parameters are present in the incoming event to be matched
            eventPattern: {
            source: ['com.ecommerce.basket.checkoutbasket'], //TODO: change this
            detailType: ['CheckoutBasket']
            },
            ruleName: 'CheckoutBasketRule'
        })
    
        //Target Definition
        checkoutBasketRule.addTarget(new SqsQueue(props.targetQueue))

        //Granting the source to publish events to the event bus else will get AccessDenied
        eventBus.grantPutEventsTo(props.publisherFunction)

    }
}