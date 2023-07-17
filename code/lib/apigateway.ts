import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Agent } from "http";

interface EcommerceApiGatewayProps {
    productMicroservice: IFunction,
    basketMicroservice: IFunction
}

export class EcommerceApiGateway extends Construct {
    constructor(scope: Construct, id: string, props: EcommerceApiGatewayProps) {
        super(scope, id)

        //product api gateway
        this.createProductApi(props.productMicroservice)
        this.createBasketApi(props.basketMicroservice)
    }

    private createProductApi(productMicroservice: IFunction){

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
            handler: productMicroservice,
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

    private createBasketApi(basketMicroservice: IFunction) {
        //root name = basket

        //GET /basket
        //POST /basket

        //resource name = basket/{userName}

        //GET /basket/{userName}
        //POST /basket/{userName}
        //DELETE /basket/{userName}
        const apigw = new LambdaRestApi(this, 'basketApi', {
            restApiName: 'Basket Service',
            handler: basketMicroservice,
            proxy: false
        })


        const basket = apigw.root.addResource('basket')
        basket.addMethod('GET') //GET /basket
        basket.addMethod('POST') //POST /basket

        const singleBasket = basket.addResource('{userName}')
        singleBasket.addMethod('GET') //GET  /basket/{userName}
        singleBasket.addMethod('DELETE') //POST  /basket/{userName}

        const basketCheckout = basket.addResource('checkout')
        basketCheckout.addMethod('POST') //POST /basket/checkout



    }
}