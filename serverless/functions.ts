import { AWS } from '@serverless/typescript';

const functions: AWS['functions'] = {
    // Serverless HttpApi: https://www.serverless.com/framework/docs/providers/aws/events/http-api
    createOrder: {
        // Lambda handler function path
        handler: 'src/functions/createOrder/index.handler',

        // Event to trigger lambda function
        events: [
            {
                httpApi: {
                    path: '/',
                    method: 'post'
                }
            }
        ]
    },

    sendOrder: {
        // Lambda function path
        handler: 'src/functions/sendOrder/index.handler',

        // Event to trigger lambda function
        events: [
            {
                /**
                 * Stream input event type
                 * https://www.serverless.com/framework/docs/providers/aws/events/streams
                 */
                stream: {
                    type: 'dynamodb',

                    // Setting stream ARN for dynamoDB dynamically by getting attribute of dynamodb <roomConnectionTable>
                    arn: {
                        // Getting StreamArn attribute from <roomConnectionTable> defined in dynamoResources.ts
                        "Fn::GetAtt": [
                            'roomConnectionTable',
                            'StreamArn'
                        ]
                    },

                    /**
                     * Lambda will only get triggered when the REMOVE event will happen (record will be deleted)
                     * There are three types of events:
                     * INSERT: When new item is added to the table
                     * MODIFY: One or more of an existing item's attributes are modified
                     * REMOVE: When the item is deleted from the table
                     * Ref: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_Record.html
                     * 
                     * Usage in Serverless: https://www.serverless.com/framework/docs/providers/aws/events/streams#setting-filter-patterns
                     */
                    filterPatterns: [
                        {
                            eventName: ['REMOVE']
                        }
                    ]
                },
            }
        ],

        /**
         * By using serverless-iam-roles-per-function plugin to assign permission to specific lamda
         * We are extending the type of AWS.functions and the iam object doesn't match with type of AWS.functions so definitions doesn't match
         * iam doesn't exist in AWS.functions and it will throw error
         * AWS.functions type functionality can be implememnted by ourselves and extend the functionality by adding iam object but there's a easier way 
         * By @ts-expect-error, we accept that it will throw error but ignore it
         */
        // @ts-expect-error
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: ["ses:sendEmail", "sns:Publish"],
                Resource: "*",
            },
            {
                Effect: "Allow",
                Action: "dynamodb:PutItem",

                /**
                 * ARN for dynamodb resource 'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/${self:custom.roomConnectionTable}'
                 * Refer AWS Account ID and region in serverless: https://stackoverflow.com/a/68311298
                 * DynamoDB ARNs: https://iam.cloudonaut.io/reference/dynamodb.html
                 */
                Resource: {
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            "aws:",
                            "dynamodb:${aws:region}:${aws:accountId}:",
                            "table/${self:custom.roomConnectionTable}",
                        ]
                    ]
                }
            }
        ],
    },

    updateOrder: {
        // Lambda handler function path
        handler: 'src/functions/updateOrder/index.handler',

        // Event to trigger lambda function
        events: [
            {
                httpApi: {
                    path: '/renew',
                    method: 'put'
                }
            }
        ],

        // @ts-expect-error
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: ["dynamodb:UpdateItem", "dynamodb:UpdateTable", "dynamodb:UpdateTimeToLive"],
                Resource: {
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            "aws:",
                            "dynamodb:${aws:region}:${aws:accountId}:",
                            "table/${self:custom.roomConnectionTable}",
                        ]
                    ]
                }
            }
        ],
    },

    // Serverless HttpApi: https://www.serverless.com/framework/docs/providers/aws/events/http-api
    getOrders: {
        // Lambda handler function path
        handler: 'src/functions/getOrders/index.handler',

        // Event to trigger lambda function
        events: [
            {
                httpApi: {
                    path: '/user/{userId}',
                    method: 'get'
                }
            }
        ]
    },

    getOrder: {
        // Lambda handler function path
        handler: 'src/functions/getOrder/index.handler',

        // Event to trigger lambda function
        events: [
            {
                httpApi: {
                    path: '/order/{id}',
                    method: 'get'
                }
            }
        ]
    },
}

export default functions;