import { checkParamOrThrow } from './utils';

/**
 * Logs
 * @memberOf ApifyClient
 * @namespace logs
 */

export const BASE_PATH = '/v2/logs';

export default {
    /**
     * @memberof ApifyClient.logs
     * @instance
     * @param {Object} options
     * @param {String} options.logId - ID of the log which is either ID of the act build or ID of the act run.
     * @param callback
     * @returns {Promise.<string>|null}
     */
    getLog: (requestPromise, options) => {
        const { baseUrl, logId } = options;

        checkParamOrThrow(logId, 'logId', 'String');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${logId}`,
            method: 'GET',
            gzip: true,
        });
    },
};
