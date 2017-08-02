import _ from 'underscore';
import { checkParamOrThrow, pluckData, catchNotFoundOrThrow, encodeBody } from './utils';

/**
 * Acts
 * @memberOf ApifyClient
 * @namespace acts
 */

export const BASE_PATH = '/v2/acts';

export default {
    /**
     * Gets list of your acts.
     *
     * @memberof ApifyClient.acts
     * @instance
     * @param {Object} options
     * @param {string} options.token - Overwrites API token
     * @param {number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {number} [options.limit=1000] - Maximum number of array elements to return.
     * @param {number} [options.desc] - If 1 then the crawlers are sorted by the createdAt field in descending order.
     * @returns {PaginationList}
     */
    listActs: (requestPromise, options) => {
        const { baseUrl, token, offset, limit } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(limit, 'limit', 'Maybe Number');
        checkParamOrThrow(offset, 'offset', 'Maybe Number');

        const query = { token };

        if (limit) query.limit = limit;
        if (offset) query.offset = offset;

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}`,
            json: true,
            method: 'GET',
            qs: query,
        })
        .then(pluckData);
    },

    /**
     * Creates a new act.
     *
     * @memberof ApifyClient.acts
     * @instance
     * @param {Object} options
     * @param {string} options.token - Overwrites API token
     * @param {Object} options.act
     * @returns {Promise.<TResult>|*}
     */
    createAct: (requestPromise, options) => {
        const { baseUrl, token, act } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(act, 'act', 'Object');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}`,
            json: true,
            method: 'POST',
            qs: { token },
            body: act,
        })
        .then(pluckData);
    },

    /**
     * Updates act.
     *
     * @memberof ApifyClient.acts
     * @instance
     * @param {Object} options
     * @param {string} options.token - Overwrites API token
     * @param {string} options.actId - Act ID
     * @param {Object} options.act
     * @returns {Promise.<TResult>|*}
     */
    updateAct: (requestPromise, options) => {
        const { baseUrl, token, actId, act } = options;
        const safeActId = !actId && act.id ? act.id : actId;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(safeActId, 'actId', 'String');
        checkParamOrThrow(act, 'act', 'Object');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${safeActId}`,
            json: true,
            method: 'PUT',
            qs: { token },
            body: _.omit(act, 'id'),
        })
        .then(pluckData);
    },

    /**
     * Deletes act.
     *
     * @memberof ApifyClient.acts
     * @instance
     * @param {Object} options
     * @param {string} options.token - Overwrites API token
     * @param {string} options.actId - Act ID
     * @returns {*}
     */
    deleteAct: (requestPromise, options) => {
        const { baseUrl, token, actId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(actId, 'actId', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${actId}`,
            json: true,
            method: 'DELETE',
            qs: { token },
        });
    },

    /**
     * Gets act object.
     *
     * @memberof ApifyClient.acts
     * @instance
     * @param {Object} options
     * @param {string} options.token - Overwrites API token
     * @param {string} options.actId - Act ID
     * @returns {Promise.<T>}
     */
    getAct: (requestPromise, options) => {
        const { baseUrl, token, actId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(actId, 'actId', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${actId}`,
            json: true,
            method: 'GET',
            qs: { token },
        })
        .then(pluckData)
        .catch(catchNotFoundOrThrow);
    },

    /**
     * Gets list of act runs.
     *
     * @memberof ApifyClient.acts
     * @instance
     * @param {Object} options
     * @param {string} options.token - Overwrites API token
     * @param {string} options.actId - Act ID
     * @param {number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {number} [options.limit=1000] - Maximum number of array elements to return.
     * @param {number} [options.desc] - If 1 then the crawlers are sorted by the createdAt field in descending order.
     * @returns {Promise.<TResult>|*}
     */
    listRuns: (requestPromise, options) => {
        const { baseUrl, token, actId, offset, limit } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(actId, 'actId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(limit, 'limit', 'Maybe Number');
        checkParamOrThrow(offset, 'offset', 'Maybe Number');

        const query = { token };

        if (limit) query.limit = limit;
        if (offset) query.offset = offset;

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${actId}/runs`,
            json: true,
            method: 'GET',
            qs: query,
        })
        .then(pluckData);
    },

    /**
     * Runs the latest build of given act.
     *
     * @memberof ApifyClient.acts
     * @instance
     * @param {string} options.token - Overwrites API token
     * @param {string} options.actId - Act ID
     * @param {Object} options
     *
     * @returns {Promise.<TResult>|*}
     */
    // TODO: Ensure that body is null or string or buffer
    runAct: (requestPromise, options) => {
        const { baseUrl, token, actId, contentType, body, useRawBody } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(actId, 'actId', 'String');
        checkParamOrThrow(contentType, 'contentType', 'Maybe String');
        checkParamOrThrow(useRawBody, 'useRawBody', 'Maybe Boolean');

        const encodedBody = useRawBody ? body : encodeBody(body, contentType);

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${actId}/runs`,
            method: 'POST',
            qs: { token },
            headers: {
                'Content-Type': contentType,
            },
            body: encodedBody,
        })
        .then(response => JSON.parse(response))
        .then(pluckData);
    },

    /**
     * @memberof ApifyClient.acts
     * @instance
     * @param options
     * @returns {Promise.<T>}
     */
    getRun: (requestPromise, options) => {
        const { baseUrl, token, actId, runId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(actId, 'actId', 'String');
        checkParamOrThrow(runId, 'runId', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${actId}/runs/${runId}`,
            json: true,
            method: 'GET',
            qs: { token },
        })
        .then(pluckData)
        .catch(catchNotFoundOrThrow);
    },

    /**
     * @memberof ApifyClient.acts
     * @instance
     * @param options
     * @returns {Promise.<TResult>|*}
     */
    listBuilds: (requestPromise, options) => {
        const { baseUrl, token, actId, offset, limit } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(actId, 'actId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(limit, 'limit', 'Maybe Number');
        checkParamOrThrow(offset, 'offset', 'Maybe Number');

        const query = { token };

        if (limit) query.limit = limit;
        if (offset) query.offset = offset;

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${actId}/builds`,
            json: true,
            method: 'GET',
            qs: query,
        })
        .then(pluckData);
    },

    /**
     * @memberof ApifyClient.acts
     * @instance
     * @param options
     * @returns {Promise.<TResult>|*}
     */
    buildAct: (requestPromise, options) => {
        const { baseUrl, token, actId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(actId, 'actId', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${actId}/builds`,
            json: true,
            method: 'POST',
            qs: { token },
        })
        .then(pluckData);
    },

    /**
     * @memberof ApifyClient.acts
     * @instance
     * @param options
     * @returns {Promise.<T>}
     */
    getBuild: (requestPromise, options) => {
        const { baseUrl, token, actId, buildId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(actId, 'actId', 'String');
        checkParamOrThrow(buildId, 'buildId', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${actId}/builds/${buildId}`,
            json: true,
            method: 'GET',
            qs: { token },
        })
        .then(pluckData)
        .catch(catchNotFoundOrThrow);
    },

};
