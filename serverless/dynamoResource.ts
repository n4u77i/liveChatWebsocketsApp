import { AWS } from "@serverless/typescript";

// Defining the dynamoDB resource
const dynamoResource: AWS['resources']['Resources'] = {
    roomConnectionTable: {
        Type: 'AWS::DynamoDB::Table',            // Type of resource

        // Creating a DynamoDB table: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html
        Properties: {
            // Using serverless CUSTOM variable, the value will be defined in serverles.ts and referenced here
            TableName: '${self:custom.roomConnectionTable}',

            // Defining table attributes (columns)
            AttributeDefinitions: [
                {
                    // <id> attribute will be the unique primary/partition key of type string acting as unique ID
                    AttributeName: 'id',
                    AttributeType: 'S',
                },

                // Adding two more attributes <pk> and <sk> as Global Secondary Index for querying data by these attributes
                {
                    // ID attribute of type string
                    AttributeName: 'pk',
                    AttributeType: 'S',
                },
                {
                    // ID attribute of type string
                    AttributeName: 'sk',
                    AttributeType: 'S',
                },
            ],

            /**
             * Defining the key for table to lookup
             * Key Schema: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-keyschema.html
             */
            KeySchema: [
                {
                    // ID attribute will be the key
                    AttributeName: 'id',

                    // The type will be HASH which is for uniquely identifying
                    KeyType: 'HASH',
                }
            ],

            // Defining the type of billing we want to use
            BillingMode: 'PAY_PER_REQUEST',

            /**
             * Global Secondary Index is used for quering on different combination of columns
             * Format: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-GlobalSecondaryIndexes
             * Usage: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html
             */
            GlobalSecondaryIndexes: [
                {
                    // The name of the global secondary index. Must be unique only for this table
                    IndexName: 'index1',

                    /**
                     * Adding <pk> and <sk> to GSI (Global Secondary Index)
                     * Key Schema: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-keyschema.html
                     */
                    KeySchema: [
                        {
                            AttributeName: 'pk',

                            // The type will be HASH which is for uniquely identifying
                            KeyType: 'HASH',
                        },
                        {
                            AttributeName: 'sk',

                            // The type will be RANGE which is for sorting
                            KeyType: 'RANGE',
                        },
                    ],

                    /**
                     * Specifies attributes that are copied (projected) from the table into the index
                     * Projection Types: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Projection.html#DDB-Type-Projection-ProjectionType
                     */
                    Projection: {
                        // All of the table attributes are copied (projected) into the index
                        ProjectionType: 'ALL'
                    }
                }
            ]
        }
    }
}

export default dynamoResource;