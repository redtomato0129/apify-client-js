import _ from 'underscore';
import { requestPromise } from './utils';
import * as acts from './acts';
import * as crawlers from './crawlers';
import keyValueStores from './key-value-stores';

export const getDefaultOptions = () => ({
    protocol: 'https',
    host: 'api.apifier.com',
    basePath: '',
    storeId: process.env.APIFY_ACT_RUN_ID, // When used inside of Act we set default storeId to act's run ID.
});

/**
 * Each property is a plain object of methods.
 *
 * Method must have 2 parameters "options" and "requestPromise" where:
 * - requestPromise is utils.requestPromise with Promise parameter set based on
 *   user's choice of Promises dependency.
 * - options
 *
 * Method must return promise.
 */
const methodGroups = {
    acts,
    crawlers,
    keyValueStores,
};

const ApifyClient = function (options = {}) {
    // This allows to initiate ApifyClient both ways - with and without "new".
    if (!this || this.constructor !== ApifyClient) return new ApifyClient(options);

    // This is used only internally for unit testing of ApifyClient.
    const undecoratedMethodGroups = options._overrideMethodGroups || methodGroups;
    delete options._overrideMethodGroups;

    const instanceOpts = Object.assign({}, getDefaultOptions(), options);

    // Choose Promises dependency and throw if no one is set.
    if (!instanceOpts.promise) {
        if (typeof Promise === 'function') {
            instanceOpts.promise = Promise;
        } else {
            throw new Error('The "options.promise" parameter is required when native Promise is not available.');
        }
    }

    const preconfiguredRequest = _.partial(requestPromise, instanceOpts.promise);

    /**
     * This decorator does:
     * - extends "options" parameter with values from default options and from ApifyClient instance options
     * - adds options.baseUrl
     * - passes preconfigured utils.requestPromise with Promises dependency set
     * - allows to use method with both callbacks and promises
     */
    const methodDecorator = (method) => {
        return (callOpts, callback) => {
            const mergedOpts = Object.assign({}, instanceOpts, callOpts);

            // Check that all required parameters are set.
            ['protocol', 'host', 'promise'].forEach((key) => {
                if (!instanceOpts[key]) throw new Error(`"options.${key}" parameter is required`);
            });

            // eslint-disable-next-line prefer-template
            mergedOpts.baseUrl = mergedOpts.protocol
                               + '://'
                               + mergedOpts.host
                               + (mergedOpts.port ? `:${mergedOpts.port}` : '')
                               + mergedOpts.basePath;

            const promise = method(preconfiguredRequest, mergedOpts);

            if (!callback) return promise;

            promise.then(
                result => callback(null, result),
                error => callback(error),
            );
        };
    };

    // Decorate methods and bind them to this object.
    _.forEach(undecoratedMethodGroups, (methodGroup, name) => {
        this[name] = _.mapObject(methodGroup, methodDecorator);
    });

    // Add setOptions(options) method to allow setOptions overriding.
    this.setOptions = (newOptions) => {
        _.forEach(newOptions, (val, key) => {
            instanceOpts[key] = val;
        });
    };
};

export default ApifyClient;
