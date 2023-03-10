import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
        console.log('In updateOrder()')
        /**
         * The url will have some params and it will be like apiUrl/renew?id=<random-order-id>
         * Destructuring the <event> varaibale to get param value passed in url
         * If no param is passed, <queryStringParameters> will be null so it will be an empty object
         */
        const { queryStringParameters = {} } = event
        const { id } = queryStringParameters

        // Getting env variables from serverless.ts file environment variables
        const tableName = process.env.roomConnectionTable

        if (!id) {
            return formatJSONResponse({
                statusCode: 400,
                data: {
                    message: 'Missing id query parameter in url'
                }
            })
        }

        /**
         * Warranty will expire after TWO years when the order is created
         * The date will be set according to the timezone of region where the lambda will be deployed
         */
        const date = new Date()
        date.setFullYear(date.getFullYear() + 2)

        const data = {
            /**
             * TTL is then value when the record should expire
             * In JS, time is in milli-seconds so date.getTime() function will return the number of milli-secs but TTL requires time in seconds
             * If number of milli-secs are not converted to secs, TTL will consider milli-secs as seconds and it will take much much longer to expire
             */
            TTL: date.getTime() / 1000,

            /**
             * This field will be removed when renewing warranty
             */
            expired: null,
            warrantyExpiry: date.getTime(),
            sk: date.toString(),
        }

        const key = {
            id
        }

        // Updating record in dynamo table
        await dynamo.update(tableName, data, key)

        return formatJSONResponse({
            data: {
                id: id,
                message: `Your order is renewed. The warranty will expire on ${new Date(date).toDateString()}`,
            }
        })
    } catch (error) {
        console.log(error)
        return formatJSONResponse({
            statusCode: 502,
            data: {
                message: error.message
            }
        })
    }
}