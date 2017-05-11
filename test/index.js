import sinon from 'sinon';
import _ from 'underscore';
import { expect } from 'chai';
import * as utils from '../build/utils';
import ApifyClient, { getDefaultOptions } from '../build';

const APIFY_INSTANCE_KEYS = ['acts', 'crawlers', 'keyValueStores', 'setOptions'];

describe('ApifyClient', () => {
    it('should be possible to initiate it both with and without "new"', () => {
        const apifyClientWith = new ApifyClient();
        const apifyClientWithout = ApifyClient();

        expect(_.keys(apifyClientWith)).to.be.eql(APIFY_INSTANCE_KEYS);
        expect(_.keys(apifyClientWithout)).to.be.eql(APIFY_INSTANCE_KEYS);
    });

    it('should correctly set all options', () => {
        const defaultOpts = getDefaultOptions();
        const instanceOpts = { storeId: 'abc123', host: 'host-overriden', basePath: 'base-path-123' };
        const callOpts = { port: 999, basePath: 'base-path-overriden', recordKey: 'some-key' };

        const expected = Object.assign({}, defaultOpts, instanceOpts, callOpts);

        // eslint-disable-next-line prefer-template
        expected.baseUrl = expected.protocol
                         + '://'
                         + expected.host
                         + (expected.port ? `:${expected.port}` : '')
                         + expected.basePath;
        expected.promise = Promise;

        instanceOpts._overrideMethodGroups = {
            group1: {
                method1: (requestPromise, params) => Promise.resolve(params),
            },
        };

        const apifyClient = new ApifyClient(instanceOpts);


        return apifyClient
            .group1
            .method1(callOpts)
            .then(options => expect(options).to.be.eql(expected));
    });

    it('should be possible to change options using apifyClient.setOptions(opts)', () => {
        const methods = {
            group1: {
                method1: (requestPromise, params) => Promise.resolve(params.baseUrl),
            },
        };

        const apifyClient1 = new ApifyClient({
            protocol: 'http',
            host: 'myhost-1',
            basePath: '/mypath-1',
            port: 80,
            _overrideMethodGroups: methods,
        }, methods);

        const apifyClient2 = new ApifyClient({
            protocol: 'http',
            host: 'myhost-2',
            basePath: '/mypath-2',
            port: 80,
            _overrideMethodGroups: methods,
        }, methods);

        return Promise
            .all([
                apifyClient1.group1.method1(),
                apifyClient2.group1.method1(),
            ])
            .then(([baseUrl1, baseUrl2]) => {
                expect(baseUrl1).to.be.eql('http://myhost-1:80/mypath-1');
                expect(baseUrl2).to.be.eql('http://myhost-2:80/mypath-2');

                apifyClient1.setOptions({ host: 'my-very-new-host' });

                return Promise
                    .all([
                        apifyClient1.group1.method1(),
                        apifyClient2.group1.method1(),
                    ])
                    .then(([anotherBaseUrl1, anotherBaseUrl2]) => {
                        expect(anotherBaseUrl1).to.be.eql('http://my-very-new-host:80/mypath-1');
                        expect(anotherBaseUrl2).to.be.eql('http://myhost-2:80/mypath-2');
                    });
            });
    });

    it('should be possible to use with promises', () => {
        const apifyClient = new ApifyClient({
            protocol: 'http',
            host: 'myhost',
            _overrideMethodGroups: {
                group1: {
                    method1: () => Promise.resolve('someResponse'),
                },
            },
        });

        return apifyClient
            .group1
            .method1()
            .then(response => expect(response).to.be.eql('someResponse'));
    });

    it('should be possible handle errors when used with promises', () => {
        const apifyClient = new ApifyClient({
            protocol: 'http',
            host: 'myhost',
            _overrideMethodGroups: {
                group1: {
                    method1: () => Promise.reject(new Error('my-error')),
                },
            },
        });

        return apifyClient
            .group1
            .method1()
            .then(
                () => { throw new Error('error-not-handled'); },
                err => expect(err.message).to.be.eql('my-error'),
            );
    });

    it('should be possible to use with callbacks', (done) => {
        const apifyClient = new ApifyClient({
            protocol: 'http',
            host: 'myhost',
            _overrideMethodGroups: {
                group1: {
                    method1: () => Promise.resolve('someResponse'),
                },
            },
        });

        apifyClient
            .group1
            .method1({}, (error, response) => {
                expect(error).to.be.eql(null);
                expect(response).to.be.eql('someResponse');
                done();
            });
    });

    it('should be possible handle errors when used with callbacks', (done) => {
        const apifyClient = new ApifyClient({
            protocol: 'http',
            host: 'myhost',
            _overrideMethodGroups: {
                group1: {
                    method1: () => Promise.reject(new Error('my-error')),
                },
            },
        });

        apifyClient
            .group1
            .method1({}, (error, response) => {
                expect(error.message).to.be.eql('my-error');
                expect(response).to.be.eql(undefined);
                done();
            });
    });

    it('should passed preconfigured utils.requestPromise to each method', () => {
        const requestPromiseMock = sinon.mock(utils, 'requestPromise');
        const expected = { foo: 'bar' };

        requestPromiseMock
            .expects('requestPromise')
            .once()
            .withArgs(Promise, expected)
            .returns(Promise.resolve());

        const apifyClient = new ApifyClient({
            protocol: 'http',
            host: 'myhost',
            _overrideMethodGroups: {
                group1: {
                    method1: requestPromise => requestPromise(expected),
                },
            },
        });

        return apifyClient
            .group1
            .method1()
            .then(() => requestPromiseMock.restore());
    });
});
