import _ from 'underscore';
import { checkParamOrThrow, gzipPromise, pluckData, catchNotFoundOrThrow, parseBody } from './utils';

/**
 * Datasets
 * @memberOf ApifyClient
 * @description
 * ### Basic usage
 * ```javascript
 * const ApifyClient = require('apify-client');
 *
 * const apifyClient = new ApifyClient({
 *        userId: 'RWnGtczasdwP63Mak',
 *        token: 'f5J7XsdaKDyRywwuGGo9',
 * });
 * const datasets = apifyClient.datasets;
 *
 * const dataset = await datasets.getOrCreateDataset({ datasetName: 'my-dataset' });
 * apifyClient.setOptions({ datasetId: dataset.id });
 * await datasets.putItem({
 *      data: { foo: 'bar' }
 * });
 * const items = await datasets.getItems();
 * await datasets.deleteStore();
 * ```
 *
 * Every method can be used as either promise or with callback. If your Node version supports await/async then you can await promise result.
 * ```javascript
 * // Awaited promise
 * try {
 *      const items = await datasets.getItems();
 *      // Do something with the items ...
 * } catch (err) {
 *      // Do something with error ...
 * }
 *
 * // Promise
 * datasets.getItems()
 * .then((items) => {
 *      // Do something with items ...
 * })
 * .catch((err) => {
 *      // Do something with error ...
 * });
 *
 * // Callback
 * datasets.getItems((err, items) => {
 *      // Do something with error or items ...
 * });
 * ```
 * @namespace datasets
 */

export const BASE_PATH = '/v2/datasets';
export const SIGNED_URL_UPLOAD_MIN_BYTESIZE = 1024 * 256;

export default {
    /**
     * Creates dataset of given name and returns it's object. If data with given name already exists then returns it's object.
     *
     * @memberof ApifyClient.datasets
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {String} options.datasetName - Custom unique name to easily identify the dataset in the future.
     * @param callback
     * @returns {Dataset}
     */
    getOrCreateDataset: (requestPromise, options) => {
        const { baseUrl, token, datasetName } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(datasetName, 'datasetName', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}`,
            json: true,
            method: 'POST',
            qs: { name: datasetName, token },
        })
            .then(pluckData);
    },

    /**
     * Gets list of datasets.
     * @descriptions By default, the objects are sorted by the createdAt field in ascending order,
     * therefore you can use pagination to incrementally fetch all datasets while new ones are still being created.
     * To sort them in descending order, use desc: 1 parameter.
     * The endpoint supports pagination using limit and offset parameters and it will not return more than 1000 array elements.
     * @memberof ApifyClient.datasets
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {Number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {Number} [options.limit=1000] - Maximum number of array elements to return.
     * @param {Number} [options.desc] - If 1 then the objects are sorted by the startedAt field in descending order.
     * @param callback
     * @returns {PaginationList}
     */
    listDatasets: (requestPromise, options) => {
        const { baseUrl, token, offset, limit, desc, unnamed } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(limit, 'limit', 'Maybe Number');
        checkParamOrThrow(offset, 'offset', 'Maybe Number');
        checkParamOrThrow(desc, 'desc', 'Maybe Boolean');
        checkParamOrThrow(unnamed, 'unnamed', 'Maybe Boolean');

        const query = { token };

        if (limit) query.limit = limit;
        if (offset) query.offset = offset;
        if (desc) query.desc = 1;
        if (unnamed) query.unnamed = 1;

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}`,
            json: true,
            method: 'GET',
            qs: query,
        })
            .then(pluckData);
    },

    /**
     * Gets dataset.
     *
     * @memberof ApifyClient.datasets
     * @instance
     * @param {Object} options
     * @param {String} options.datasetId - Unique dataset Id
     * @param callback
     * @returns {Dataset}
     */
    getDataset: (requestPromise, options) => {
        const { baseUrl, datasetId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(datasetId, 'datasetId', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${datasetId}`,
            json: true,
            method: 'GET',
        })
            .then(pluckData)
            .catch(catchNotFoundOrThrow);
    },

    /**
     * Deletes dataset.
     *
     * @memberof ApifyClient.datasets
     * @instance
     * @param {Object} options
     * @param {String} options.datasetId - Store Id
     * @param callback
     * @returns {*}
     */
    deleteDataset: (requestPromise, options) => {
        const { baseUrl, datasetId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(datasetId, 'datasetId', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${datasetId}`,
            json: true,
            method: 'DELETE',
        });
    },

    /**
     * Gets items in the dataset based based on the provided parameters
     *
     * @memberof ApifyClient.datasets
     * @instance
     * @param {Object} options
     * @param {String} options.datasetId - Unique dataset Id
     * @param {String} [options.format='json'] - Format of the items, possible values are: json, csv, xlsx, html, xml and rss.
     * @param {Number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {Number} [options.limit=100000] - Maximum number of array elements to return.
     * @param {Number} [options.desc] - If 1 then the objects are sorted by createdAt in descending order.
     * @param {Array} [options.fields] - If provided then returned objects will only contain specified keys
     * @param {String} [options.unwind] - If provided then objects will be unwound based on provided field
     * @param {Boolean} [options.disableBodyParser] - If true then response from API will not be parsed
     * @param {Number} [options.attachment] - If 1 then the response will define the Content-Disposition: attachment header, forcing a web
     *                                        browser to download the file rather than to display it. By default this header is not present.
     * @param {String} [options.delimiter=','] - A delimiter character for CSV files, only used if format=csv. You might need to URL-encode
     *                                           the character (e.g. use %09 for tab or %3B for semicolon).
     * @param {Number} [options.bom] - All responses are encoded in UTF-8 encoding. By default, the csv files are prefixed with the UTF-8 Byte
     *                                 Order Mark (BOM), while json, jsonl, xml, html and rss files are not. If you want to override this default
     *                                 behavior, specify bom=1 query parameter to include the BOM or bom=0 to skip it.
     * @param {String} [options.xmlRoot] - Overrides default root element name of xml output. By default the root element is results.
     * @param {String} [options.xmlRow] - Overrides default element name that wraps each page or page function result object in xml output.
     *                                    By default the element name is page or result based on value of simplified parameter.
     * @param callback
     * @returns {DatasetItems}
     */
    getItems: (requestPromise, options) => {
        const {
            baseUrl,
            datasetId,
            offset,
            limit,
            fields,
            omit,
            unwind,
            desc,
            bom,
            attachment,
            delimiter,
            disableBodyParser,
            xmlRoot,
            xmlRow,
        } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(datasetId, 'datasetId', 'String');
        checkParamOrThrow(limit, 'limit', 'Maybe Number');
        checkParamOrThrow(offset, 'offset', 'Maybe Number');
        checkParamOrThrow(fields, 'fields', 'Maybe Array');
        checkParamOrThrow(omit, 'omit', 'Maybe Array');
        checkParamOrThrow(unwind, 'unwind', 'Maybe String');
        checkParamOrThrow(desc, 'desc', 'Maybe Boolean');
        checkParamOrThrow(bom, 'bom', 'Maybe Boolean');
        checkParamOrThrow(attachment, 'attachment', 'Maybe Boolean');
        checkParamOrThrow(delimiter, 'delimiter', 'Maybe String');
        checkParamOrThrow(xmlRoot, 'xmlRoot', 'Maybe String');
        checkParamOrThrow(xmlRow, 'xmlRow', 'Maybe String');

        const requestOpts = {
            url: `${baseUrl}${BASE_PATH}/${datasetId}/items`,
            method: 'GET',
            qs: {},
            json: false,
            gzip: true,
            resolveWithResponse: true,
            encoding: null,
        };

        const queryString = _.pick(options,
            'format', 'fields', 'omit', 'unwind', 'offset',
            'limit', 'desc', 'attachment',
            'delimiter', 'bom', 'xmlRoot', 'xmlRow');

        if (!_.isEmpty(queryString)) {
            if (queryString && queryString.fields) queryString.fields = queryString.fields.join(',');
            requestOpts.qs = queryString;
        }

        const parseResponse = (response) => {
            const responseBody = response.body;
            const contentType = response.headers['content-type'];
            const body = disableBodyParser ? responseBody : parseBody(responseBody, contentType);
            return body;
        };

        return requestPromise(requestOpts)
            .then(parseResponse)
            .catch(catchNotFoundOrThrow);
    },

    /**
     * Saves the items into dataset.
     *
     * @memberof ApifyClient.datasets
     * @instance
     * @param {Object} options
     * @param {String} options.datasetId - Unique dataset Id
     * @param {Object | Array} options.data - Object or Array of objects, only objects that can be JSON.stringified are allowed
     * @param callback
     * @returns {*}
     */
    putItems: (requestPromise, options) => {
        const { baseUrl, datasetId, data } = options;
        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(datasetId, 'datasetId', 'String');
        checkParamOrThrow(data, 'data', 'Object | Array');

        return gzipPromise(options.promise, JSON.stringify(data))
            .then((gzipedBody) => {
                const requestOpts = {
                    url: `${baseUrl}${BASE_PATH}/${datasetId}/items`,
                    method: 'POST',
                    body: gzipedBody,
                    json: false,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Content-Encoding': 'gzip',
                    },
                };

                // Uploading via our servers:
                return requestPromise(requestOpts);
            });
    },
};
