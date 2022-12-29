import type { AWS } from '@serverless/typescript';

import functions from './serverless/functions'
import dynamoResource from './serverless/dynamoResource'

const serverlessConfiguration: AWS = {
  service: 'livechatapp',
  frameworkVersion: '3',
  /**
   * serverless-iam-roles-per-function is a plugin used for assigning specific permissions to specific lambdas
   * The plugin needs to be installed on as a dev dependency as it is not required by the Lambda functions
   * This plugin just runs at a compilation time and not in a Lambda
   * Install it as: npm i -D serverless-iam-roles-per-function
   * Ref: https://github.com/functionalone/serverless-iam-roles-per-function
   */
  plugins: ['serverless-esbuild', 'serverless-iam-roles-per-function'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile: 'nautti_serverless_dell_user',             // AWS user in credentials file, if left default is used
    region: 'us-east-1',                                // Default region (if not mentioned explicitly)

    /**
     * Allowing lambda to do anything with Dynamo resource
     * https://www.serverless.com/framework/docs/tutorial#setting-function-permissions
     */
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "dynamodb:*",

            /**
             * ARN for dynamodb resource 'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/${self:custom.roomConnectionTable}'
             * Refer AWS Account ID and region in serverless: https://stackoverflow.com/a/68311298
             * DynamoDB ARNs: https://iam.cloudonaut.io/reference/dynamodb.html
             */
            Resource: [
              /**
               * IAM policy to grant access to a specific DynamoDB table and its indexes
               * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/iam-policy-specific-table-indexes.html
               * 
               * In this case index is used for querying data
               * Index name is <index1> defined in dynamoResources.ts
               */
              {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    "aws:",
                    "dynamodb:${aws:region}:${aws:accountId}:",
                    "table/${self:custom.roomConnectionTable}",
                  ]
                ]
              },
              {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    "aws:",
                    "dynamodb:${aws:region}:${aws:accountId}:",
                    "table/${self:custom.roomConnectionTable}/index/index1",
                  ]
                ]
              }
            ]
          },
        ]
      }
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },

    // Export serverless envs to .env file via plugin: https://www.serverless.com/plugins/serverless-export-env
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',

      /**
       * Defining custom variables
       * https://www.serverless.com/framework/docs/tutorial#making-the-database-table-name-available-to-the-function
       */
      roomConnectionTable: '${self:custom.roomConnectionTable}',        // Defining name of table in env variable
    },
  },

  // import the function via paths
  functions,

  // Add custom resources
  resources: {
    Resources: {
      ...dynamoResource,
    }
  },
  package: { individually: true },
  custom: {
    // Defining our custom variable for table name, <sls-stage> variable will allow us to define type of env like dev or prod
    roomConnectionTable: '${sls:stage}-room-connection-table',
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
