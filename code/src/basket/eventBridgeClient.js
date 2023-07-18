import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

//Creating event bridge service client object
export const ebClient = new EventBridgeClient()