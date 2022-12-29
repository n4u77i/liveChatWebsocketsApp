import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
        // Getting <id> passed in the URL path params
        const { id } = event.pathParameters || {}

        // Getting table name from serverless.ts file
        const tableName = process.env.roomConnectionTable

        if (!id) {
            return formatJSONResponse({
                statusCode: 400,
                data: {
                    message: 'Missing id in path of URL'
                }
            })
        }

        const key = {
            id
        }

        const data = await dynamo.get({ tableName, key })

        return formatJSONResponse({
            data
        })
    } catch (error) {
        console.log('Error: ', error)
        return formatJSONResponse({
            statusCode: 500,
            data: {
                message: error.message
            }
        })
    }
}