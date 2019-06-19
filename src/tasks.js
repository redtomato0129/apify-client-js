import _ from 'underscore';
import log from 'apify-shared/log';
import {
    checkParamOrThrow,
    pluckData,
    parseDateFields,
    catchNotFoundOrThrow,
    stringifyWebhooksToBase64,
} from './utils';

/**
 * Tasks
 * @memberOf ApifyClient
 * @description
 * ### Basic usage
 * Every method can be used as either promise or with callback. If your Node version supports await/async then you can await promise result.
 * ```javascript
 * const ApifyClient = require('apify-client');
 *
 * const apifyClient = new ApifyClient({
 *  userId: 'jklnDMNKLekk',
 *  token: 'SNjkeiuoeD443lpod68dk',
 * });
 *
 * // Awaited promise
 * try {
 *      const tasksList = await apifyClient.tasks.listTasks({});
 *      // Do something with the tasksList ...
 * } catch (err) {
 *      // Do something with error ...
 * }
 *
 * // Promise
 * apifyClient.tasks.listTasks({})
 * .then((tasksList) => {
 *      // Do something tasksList ...
 * })
 * .catch((err) => {
 *      // Do something with error ...
 * });
 *
 * // Callback
 * apifyClient.tasks.listTasks({}, (err, tasksList) => {
 *      // Do something with error or tasksList ...
 * });
 * ```
 * @namespace tasks
 */

export const BASE_PATH = '/v2/actor-tasks';

const replaceSlashWithTilde = str => str.replace('/', '~');

export default {
    /**
     * Gets list of your tasks.
     * @description By default, the objects are sorted by the createdAt field in ascending order,
     * therefore you can use pagination to incrementally fetch all tasks while new ones are still being created.
     * To sort them in descending order, use desc: `true` parameter.
     * The endpoint supports pagination using limit and offset parameters and it will not return more than 1000 array elements.
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {Number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {Number} [options.limit=1000] - Maximum number of array elements to return.
     * @param {Boolean} [options.desc] - If `true` then the objects are sorted by the createdAt field in descending order.
     * @param callback
     * @returns {PaginationList}
     */
    listTasks: (requestPromise, options) => {
        const { baseUrl, token, offset, limit, desc } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(limit, 'limit', 'Maybe Number');
        checkParamOrThrow(offset, 'offset', 'Maybe Number');
        checkParamOrThrow(desc, 'desc', 'Maybe Boolean');

        const query = { token };

        if (limit) query.limit = limit;
        if (offset) query.offset = offset;
        if (desc) query.desc = 1;

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}`,
            json: true,
            method: 'GET',
            qs: query,
        })
            .then(pluckData)
            .then(parseDateFields);
    },

    /**
     * Creates a new task.
     *
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {Object} options.task Object containing configuration of the task
     * @param callback
     * @returns {Task}
     */
    createTask: (requestPromise, options) => {
        const { baseUrl, token, task } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(task, 'task', 'Object');

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}`,
            json: true,
            method: 'POST',
            qs: { token },
            body: task,
        })
            .then(pluckData)
            .then(parseDateFields);
    },

    /**
     * Updates task.
     *
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {String} options.taskId - Unique task ID
     * @param {Object} options.task
     * @param callback
     * @returns {Task}
     */
    updateTask: (requestPromise, options) => {
        const { baseUrl, token, taskId, task } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(task, 'task', 'Object');

        if (taskId) checkParamOrThrow(taskId, 'taskId', 'String');
        else checkParamOrThrow(task.id, 'task.id', 'String');

        const safeTaskId = replaceSlashWithTilde(!taskId && task.id ? task.id : taskId);

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${safeTaskId}`,
            json: true,
            method: 'PUT',
            qs: { token },
            body: _.omit(task, 'id'),
        })
            .then(pluckData)
            .then(parseDateFields);
    },

    /**
     * Deletes task.
     *
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {String} options.taskId - Unique task ID
     * @param callback
     */
    deleteTask: (requestPromise, options) => {
        const { baseUrl, token, taskId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(taskId, 'taskId', 'String');

        const safeTaskId = replaceSlashWithTilde(taskId);

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${safeTaskId}`,
            json: true,
            method: 'DELETE',
            qs: { token },
        })
            .then(parseDateFields);
    },

    /**
     * Gets task object.
     *
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param {String} options.token Optional
     * @param {String} options.taskId - Unique task ID
     * @param callback
     * @returns {Task}
     */
    getTask: (requestPromise, options) => {
        const { baseUrl, token, taskId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        // Remove line bellow when we enable public tasks
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(taskId, 'taskId', 'String');

        const safeTaskId = replaceSlashWithTilde(taskId);

        const qs = {};
        // Line bellow will be used if we enable tasks to be public
        // if (token) qs.token = token;
        qs.token = token;


        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${safeTaskId}`,
            json: true,
            method: 'GET',
            qs,
        })
            .then(pluckData)
            .then(parseDateFields)
            .catch(catchNotFoundOrThrow);
    },

    /**
     * Gets list of task runs.
     *
     * By default, the objects are sorted by the startedAt field in ascending order,
     * therefore you can use pagination to incrementally fetch all builds while new ones are still being created.
     * To sort them in descending order, use desc: `true` parameter.
     *
     * The endpoint supports pagination using limit and offset parameters and it will not return more than 1000 array elements.
     *
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {String} options.taskId - Unique task ID
     * @param {Number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {Number} [options.limit=1000] - Maximum number of array elements to return.
     * @param {Boolean} [options.desc] - If `true` then the objects are sorted by the createdAt field in descending order.
     * @param callback
     * @returns {PaginationList}
     */
    listRuns: (requestPromise, options) => {
        const { baseUrl, token, taskId, offset, limit, desc } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(taskId, 'taskId', 'String');
        checkParamOrThrow(limit, 'limit', 'Maybe Number');
        checkParamOrThrow(offset, 'offset', 'Maybe Number');
        checkParamOrThrow(desc, 'desc', 'Maybe Boolean');

        const safeTaskId = replaceSlashWithTilde(taskId);
        const query = { token };

        if (limit) query.limit = limit;
        if (offset) query.offset = offset;
        if (desc) query.desc = 1;

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${safeTaskId}/runs`,
            json: true,
            method: 'GET',
            qs: query,
        })
            .then(pluckData)
            .then(parseDateFields);
    },

    /**
     * Runs the given task.
     *
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param {String} options.taskId - Unique task ID
     * @param [options.token]
     * @param {Number} [options.waitForFinish] - Number of seconds to wait for task to finish. Maximum value is 120s.
                                                 If task doesn't finish in time then task run in RUNNING state is returned.
     * @param {Object} [options.input] - Actor task input object.
     * @param {Number} [options.timeout] - Timeout for the act run in seconds. Zero value means there is no timeout.
     * @param {Number} [options.memory] - Amount of memory allocated for the act run, in megabytes.
     * @param {String} [options.build] - Tag or number of the build to run (e.g. <code>latest</code> or <code>1.2.34</code>).
     * @param {Array}  [options.webhooks] - Specifies optional webhooks associated with the actor run,
     *                                      which can be used to receive a notification e.g. when the actor finished or failed,
     *                                      see {@link https://apify.com/docs/webhooks#adhoc|ad hook webhooks documentation} for detailed description.
     * @param callback
     * @returns {ActRun}
     */
    runTask: (requestPromise, options) => {
        const { baseUrl, token, taskId, waitForFinish, body, contentType, timeout, memory, build, webhooks, input } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(taskId, 'taskId', 'String');
        checkParamOrThrow(waitForFinish, 'waitForFinish', 'Maybe Number');
        checkParamOrThrow(timeout, 'timeout', 'Maybe Number');
        checkParamOrThrow(memory, 'memory', 'Maybe Number');
        checkParamOrThrow(build, 'build', 'Maybe String');
        checkParamOrThrow(webhooks, 'webhooks', 'Maybe Array');
        checkParamOrThrow(input, 'input', 'Maybe Object');

        const safeTaskId = replaceSlashWithTilde(taskId);
        const query = { token };

        if (waitForFinish) query.waitForFinish = waitForFinish;
        if (timeout) query.timeout = timeout;
        if (memory) query.memory = memory;
        if (build) query.build = build;
        if (webhooks) query.webhooks = stringifyWebhooksToBase64(webhooks);

        const opts = {
            url: `${baseUrl}${BASE_PATH}/${safeTaskId}/runs`,
            method: 'POST',
            qs: query,
        };

        // This is for backwards compatiblity.
        // TODO: Remove when releasing v1.0.
        if (body) {
            if (input) {
                throw new Error('You cannot use deprecated parameter "body" along with its replacement "input"!');
            }
            checkParamOrThrow(contentType, 'contentType', 'Maybe String');
            checkParamOrThrow(body, 'body', 'String');
            log.deprecated('Parameter "body" of client.tasks.runTask() method is depredated. Use "input" parameter instead.');
            opts.body = body;
            if (contentType) opts.headers = { 'Content-Type': contentType };
        }

        if (input) {
            opts.body = input;
            opts.json = true;
        }

        return requestPromise(opts)
            .then(response => (opts.json ? response : JSON.parse(response)))
            .then(pluckData)
            .then(parseDateFields);
    },

    /**
     * Gets list of webhooks for given actor task.
     *
     * @memberof ApifyClient.acts
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {String} options.taskId - Unique task ID
     * @param {Number} [options.offset=0] - Number of array elements that should be skipped at the start.
     * @param {Number} [options.limit=1000] - Maximum number of array elements to return.
     * @param {Boolean} [options.desc] - If `true` then the objects are sorted by the createdAt field in descending order.
     * @param callback
     * @returns {PaginationList}
     */
    listWebhooks: (requestPromise, options) => {
        const { baseUrl, token, taskId, offset, limit, desc } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(taskId, 'taskId', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(limit, 'limit', 'Maybe Number');
        checkParamOrThrow(offset, 'offset', 'Maybe Number');
        checkParamOrThrow(desc, 'desc', 'Maybe Boolean');

        const safeTaskId = replaceSlashWithTilde(taskId);
        const query = { token };

        if (limit) query.limit = limit;
        if (offset) query.offset = offset;
        if (desc) query.desc = 1;

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${safeTaskId}/webhooks`,
            json: true,
            method: 'GET',
            qs: query,
        })
            .then(pluckData)
            .then(parseDateFields);
    },

    /**
     * Gets the actor task input.
     *
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {String} options.taskId - Unique task ID
     * @param callback
     * @returns {Object}
     */
    getInput: (requestPromise, options) => {
        const { baseUrl, token, taskId } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(taskId, 'taskId', 'String');

        const safeTaskId = replaceSlashWithTilde(taskId);

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${safeTaskId}/input`,
            json: true,
            method: 'GET',
            qs: { token },
        });
    },

    /**
     * Updates the actor task input.
     *
     * @memberof ApifyClient.tasks
     * @instance
     * @param {Object} options
     * @param options.token
     * @param {String} options.taskId - Unique task ID
     * @param {Object} options.input - Input object.
     * @param callback
     * @returns {Object}
     */
    updateInput: (requestPromise, options) => {
        const { baseUrl, token, taskId, input } = options;

        checkParamOrThrow(baseUrl, 'baseUrl', 'String');
        checkParamOrThrow(token, 'token', 'String');
        checkParamOrThrow(taskId, 'taskId', 'String');
        checkParamOrThrow(input, 'input', 'Object');

        const safeTaskId = replaceSlashWithTilde(taskId);

        return requestPromise({
            url: `${baseUrl}${BASE_PATH}/${safeTaskId}/input`,
            json: true,
            method: 'PUT',
            qs: { token },
            body: input,
        });
    },
};
