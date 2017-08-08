import _ from 'underscore';

import { checkParamOrThrow, catchNotFoundOrThrow } from './utils';

/**
 * Crawlers
 * @memberof ApifyClient
 * @namespace crawlers
 * @description
 * ### Basic usage
 * ```javascript
 * const ApifyClient = require('apify-client');
 *
 * const apifyClient = new ApifyClient({
 *        userId: 'RWnGtczasdwP63Mak',
 *        token: 'f5J7XsdaKDyRywwuGGo9',
 * });
 *
 * const crawlerSettings = {
 *      customId: 'Test',
 *      startUrls: [ {key: 'test', value: 'http://example.com/' } ],
 *      pageFunction: `
 *          function pageFunction(context) {
 *              // called on every page the crawler visits, use it to extract data from it
 *              var $ = context.jQuery;
 *              var result = {
 *                  title: $('title').text();
 *              };
 *              return result;
 *          }
 *      `,
 *      injectJQuery: true,
 * };
 *
 * const crawler = await apifyClient.crawlers.createCrawler({ settings: crawlerSettings });
 * const execution = await apifyClient.crawlers.startExecution({ crawlerId: crawler._id, wait: 5 });
 * const results = await apifyClient.crawlers.getExecutionResults({ executionId: execution._id });
 * console.log(results.items[0].pageFunctionResult) // { title: 'Example Domain' }
 * ```
 *
 * Every method can be used as either promise or with callback. If your Node version supports await/async
 * then you can await promise result.
 * ```javascript
 * const options = { crawlerId: 'DNjkhrkjnri' };
 * // Awaited promise
 * try {
 *      const crawler = await apifyClient.crawlers.getCrawlerSettings(options);
 *      // Do something crawler ...
 * } catch (err) {
 *      // Do something with error ...
 * }
 * // Promise
 * apifyClient.crawlers.getCrawlerSettings(options)
 * .then((crawler) => {
 *      // Do something crawler ...
 * })
 * .catch((err) => {
 *      // Do something with error ...
 * });
 * // Callback
 * apifyClient.crawlers.getCrawlerSettings(options, (err, crawler) => {
 *      // Do something with error and crawler ...
 * });
 * ```
 */

export const BASE_PATH = '/v1';

function wrapArray(response) {
    /**
     * @typedef {Object} PaginationList
     * @property {Array} items - List of returned objects
     * @property {Number} total - Total number of object
     * @property {Number} offset - Number of Request objects that was skipped at the start.
     * @property {Number} count - Number of returned objects
     * @property {Number} limit - Requested limit
     */
    return {
        items: response.body,
        total: response.headers['x-apifier-pagination-total'],
        offset: response.headers['x-apifier-pagination-offset'],
        count: response.headers['x-apifier-pagination-count'],
        limit: response.headers['x-apifier-pagination-limit'],
    };
}

export default {
    /**
     * Gets a list of crawlers belonging to a specific user.
     * @description By default, the objects are sorted by the createdAt field in ascending order,
     * therefore you can use pagination to incrementally fetch all crawlers while new ones are still being created.
     * To sort them in descending order, use desc: 1 parameter.
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {Number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {Number} [options.limit=1000] - Maximum number of array elements to return.
     * @param {Number} [options.desc] - If 1 then the crawlers are sorted by the createdAt field in descending order.
     * @param callback
     * @returns {PaginationList}
     */
    listCrawlers: (requestPromise, options) => {
        const { userId, token } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(token, 'token', 'String');

        const queryString = _.pick(options, 'token', 'offset', 'limit', 'desc');

        return requestPromise({
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers`,
            json: true,
            method: 'GET',
            qs: queryString,
            resolveWithResponse: true,
        }).then(wrapArray);
    },

    /**
     * Creates a new crawler.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {Object} options.settings - Crawler settings, customId is required. See
     *                 [main documentation]{@link https://www.apifier.com/docs#basic-settings} for detailed
     *                 description of crawler settings. Unknown properties in the object are silently ignored.
     * @param callback
     * @returns {CrawlerSettings}
     */
    createCrawler: (requestPromise, options) => {
        const { userId, token, settings } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(settings, 'settings', 'Object');
        checkParamOrThrow(settings.customId, 'settings.customId', 'String');

        const requestParams = {
            json: true,
            method: 'POST',
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers`,
            qs: { token },
            body: settings,
        };

        return requestPromise(requestParams);
    },

    /**
     * Updates a specific crawler.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {String} options.crawlerId - Crawler ID or crawler custom ID
     * @param {Object} options.settings - Crawler settings, customId is required. See
     *                 [main documentation]{@link https://www.apifier.com/docs#basic-settings} for detailed
     *                 description of crawler settings. Unknown properties in the object are silently ignored.
     * @param callback
     * @returns {CrawlerSettings}
     */
    updateCrawler: (requestPromise, options) => {
        const { userId, token, settings, crawlerId } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(crawlerId, 'crawlerId', 'String');
        checkParamOrThrow(settings, 'settings', 'Object');

        const requestParams = {
            json: true,
            method: 'PUT',
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers/${crawlerId}`,
            qs: { token },
            body: settings,
        };

        return requestPromise(requestParams);
    },

    /**
     * Gets full details and settings of a specific crawler.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {String} options.crawlerId - Crawler ID or crawler custom ID
     * @param callback
     * @returns {CrawlerSettings}
     */
    getCrawlerSettings: (requestPromise, options) => {
        const { userId, token, crawlerId } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(crawlerId, 'crawlerId', 'String');

        const queryString = _.pick(options, 'token', 'nosecrets');

        return requestPromise({
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers/${crawlerId}`,
            json: true,
            method: 'GET',
            qs: queryString,
        }).catch(catchNotFoundOrThrow);
    },

    /**
     * Deletes a specific crawler.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param callback
     * @param {String} options.crawlerId - Crawler ID or crawler custom ID
     */
    deleteCrawler: (requestPromise, options) => {
        const { userId, token, crawlerId } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(crawlerId, 'crawlerId', 'String');

        return requestPromise({
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers/${crawlerId}`,
            json: true,
            method: 'DELETE',
            qs: { token },
        });
    },

    /**
     * Starts execution of a specific crawler.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {String} options.crawlerId - Crawler ID or crawler custom ID
     * @param {String} [options.tag] - Custom tag for the execution. It cannot be longer than 64 characters.
     * @param {Number} [options.wait=0] - The maximum number of seconds the server waits for the execution to finish.
     * @param {Object} [options.settings] - Overwrites crawler settings for execution.
     * @param callback
     * @returns {Execution}
     */
    startExecution: (requestPromise, options) => {
        const { crawlerId, userId, token, settings } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(crawlerId, 'crawlerId', 'String');
        checkParamOrThrow(settings, 'settings', 'Maybe Object');

        const queryString = _.pick(options, 'token', 'tag', 'wait');

        const requestParams = {
            json: true,
            method: 'POST',
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers/${crawlerId}/execute`,
            qs: queryString,
        };
        if (!_.isEmpty(settings)) {
            requestParams.body = settings;
        }

        return requestPromise(requestParams);
    },

    /**
     * Stops a specific crawler execution.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {String} options.executionId - Execution ID
     * @param callback
     * @returns {Execution}
     */
    stopExecution: (requestPromise, options) => {
        const { executionId, token } = options;

        checkParamOrThrow(executionId, 'executionId', 'String');
        checkParamOrThrow(token, 'token', 'String');

        const requestParams = {
            json: true,
            method: 'POST',
            url: `${options.baseUrl}${BASE_PATH}/execs/${executionId}/stop`,
            qs: { token },
        };

        return requestPromise(requestParams);
    },

    /**
     * Gets a list of executions of a specific crawler.
     *
     * @memberof ApifyClient.crawlers
     * @descriptions Gets a list of executions of a specific crawler. Optionally,
     * you can use status parameter to filter the list to only contain executions with a specific status
     * (for example, status 'RUNNING' will only return executions that are still running).
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {String} options.crawlerId - Crawler ID or crawler custom ID
     * @param {String} [options.status] - Filter for the execution status.
     * @param {Number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {Number} [options.limit=1000] - Maximum number of array elements to return.
     * @param {Number} [options.desc] - If 1 then the executions are sorted by the startedAt field in descending order.
     * @param callback
     * @returns {PaginationList}
     */
    getListOfExecutions: (requestPromise, options) => {
        const { userId, crawlerId, token } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(crawlerId, 'crawlerId', 'String');
        checkParamOrThrow(token, 'token', 'String');

        const queryString = _.pick(options, 'token', 'status', 'offset', 'limit', 'desc');

        return requestPromise({
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers/${crawlerId}/execs`,
            json: true,
            method: 'GET',
            qs: queryString,
            resolveWithResponse: true,
        }).then(wrapArray);
    },

    /**
     * Gets details of a single crawler execution.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param {String} options.executionId - Execution ID
     * @param callback
     * @returns {Execution}
     */
    getExecutionDetails: (requestPromise, options) => {
        const { executionId } = options;

        checkParamOrThrow(executionId, 'executionId', 'String');

        return requestPromise({
            url: `${options.baseUrl}${BASE_PATH}/execs/${executionId}`,
            json: true,
            method: 'GET',
        }).catch(catchNotFoundOrThrow);
    },

    /**
     * Gets information about the last execution of a specific crawler.
     * @description Gets information about the last execution of a specific crawler.
     * Optionally, you can use status parameter to only get the last execution with a specific status.
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {String} options.crawlerId - Crawler ID or crawler custom ID
     * @param {String} [options.status] - Filter for the execution status.
     * @param callback
     * @returns {Execution}
     */
    getLastExecution: (requestPromise, options) => {
        const { userId, crawlerId, token } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(crawlerId, 'crawlerId', 'String');
        checkParamOrThrow(token, 'token', 'String');

        const queryString = _.pick(options, 'token', 'status');

        return requestPromise({
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers/${crawlerId}/lastExec`,
            json: true,
            method: 'GET',
            qs: queryString,
        });
    },

    /**
     * Gets results of a specific execution.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param {String} options.executionId - Execution ID
     * @param {String} [options.format='json'] - Format of the results, possible values are: json, jsonl, csv, html, xml and rss.
     * @param {Number} [options.simplified] - If 1 then the results will be returned in a simplified form without crawling metadata.
     * @param {Number} [options.offset=0] - Number of Request objects that should be skipped at the start.
     * @param {Number} [options.limit=100000] - Maximum number of Request objects to return.
     * @param {Number} [options.desc] - By default, results are returned in the same order as they were stored in database.
     *                                  To reverse the order, set this parameter to 1.
     * @param {Number} [options.attachment] - If 1 then the response will define the Content-Disposition: attachment header, forcing a web
     *                                        browser to download the file rather than to display it. By default this header is not present.
     * @param {String} [options.delimiter=','] - A delimiter character for CSV files, only used if format=csv. You might need to URL-encode
     *                                           the character (e.g. use %09 for tab or %3B for semicolon).
     * @param {Number} [options.bom] - All responses are encoded in UTF-8 encoding. By default, the csv files are prefixed with the UTF-8 Byte
     *                                 Order Mark (BOM), while json, jsonl, xml, html and rss files are not. If you want to override this default
     *                                 behavior, specify bom=1 query parameter to include the BOM or bom=0 to skip it.
     * @param callback
     * @returns {PaginationList}
     */
    getExecutionResults: (requestPromise, options) => {
        const { executionId } = options;

        checkParamOrThrow(executionId, 'executionId', 'String');

        const requestParams = {
            url: `${options.baseUrl}${BASE_PATH}/execs/${executionId}/results`,
            json: true,
            method: 'GET',
            resolveWithResponse: true,
        };
        const queryString = _.pick(options, 'format', 'simplified', 'offset', 'limit', 'desc', 'attachment', 'delimiter', 'bom');
        if (!_.isEmpty(queryString)) {
            requestParams.qs = queryString;
        }

        return requestPromise(requestParams).then(wrapArray);
    },

    /**
     * Gets results of a last execution.
     *
     * @memberof ApifyClient.crawlers
     * @instance
     * @param {Object} options
     * @param options.userId
     * @param options.token
     * @param {String} options.crawlerId - Crawler ID or crawler custom ID
     * @param {String} options.status - Filter for the execution status.
     * @param {String} [options.format='json'] - Format of the results, possible values are: json, jsonl, csv, html, xml and rss.
     * @param {Number} [options.simplified] - If 1 then the results will be returned in a simplified form without crawling metadata.
     * @param {Number} [options.offset=0] - Number of Request objects that should be skipped at the start.
     * @param {Number} [options.limit=100000] - Maximum number of Request objects to return.
     * @param {Number} [options.desc] - By default, results are returned in the same order as they were stored in database. To reverse
     *                                  the order, set this parameter to 1.
     * @param {Number} [options.attachment] - If 1 then the response will define the Content-Disposition: attachment header, forcing a web
     *                                        browser to download the file rather than to display it. By default this header is not present.
     * @param {String} [options.delimiter=','] - A delimiter character for CSV files, only used if format=csv. You might need to URL-encode
     *                                           the character (e.g. use %09 for tab or %3B for semicolon).
     * @param {Number} [options.bom] - All responses are encoded in UTF-8 encoding. By default, the csv files are prefixed with the UTF-8 Byte
     *                                 Order Mark (BOM), while json, jsonl, xml, html and rss files are not. If you want to override this default
     *                                 behavior, specify bom=1 query parameter to include the BOM or bom=0 to skip it.
     * @param callback
     * @returns {PaginationList}
     */
    getLastExecutionResults: (requestPromise, options) => {
        const { userId, token, crawlerId } = options;

        checkParamOrThrow(userId, 'userId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(crawlerId, 'crawlerId', 'String');

        const requestParams = {
            url: `${options.baseUrl}${BASE_PATH}/${userId}/crawlers/${crawlerId}/lastExec/results`,
            json: true,
            method: 'GET',
            resolveWithResponse: true,
        };
        const queryString = _.pick(options, 'status', 'token', 'format', 'simplified', 'offset', 'limit', 'desc', 'attachment', 'delimiter', 'bom');
        if (!_.isEmpty(queryString)) {
            requestParams.qs = queryString;
        }

        return requestPromise(requestParams).then(wrapArray);
    },

    _resurrectExecution: (requestPromise, { baseUrl, executionId }) => requestPromise({
        url: `${baseUrl}${BASE_PATH}/execs/${executionId}/resurrect`,
        json: true,
        method: 'POST',
    }),

    _enqueuePage: (requestPromise, { baseUrl, executionId, urls }) => requestPromise({
        url: `${baseUrl}${BASE_PATH}/execs/${executionId}/enqueue`,
        json: true,
        method: 'POST',
        body: urls,
    }),
};
