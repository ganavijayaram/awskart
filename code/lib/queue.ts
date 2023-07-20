import { Duration } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { IQueue, Queue } from "aws-cdk-lib/aws-sqs";
import { Construct, ConstructOrder } from "constructs";

interface EcommerceQueueProps {
    consumer: IFunction
}

export class EcommerceQueue extends Construct {
    public readonly orderQueue: IQueue;

    constructor(scope: Construct, id: string, props: EcommerceQueueProps) {
        super(scope, id)

        //Creating queue
        this.orderQueue = new Queue(this, 'OrderQueue', {
            queueName: 'OrderQueue',
            visibilityTimeout: Duration.seconds(30)
        })
        //Consumer = orderMicroservices will be receiving their events from the queue

        props.consumer.addEventSource(new SqsEventSource(this.orderQueue, {
            //The numbers of messages received by the lambda function of
            // ordering service when polling the queue
            batchSize: 1
        }))
    }
}