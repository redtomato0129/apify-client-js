import sinon from 'sinon';
import _ from 'underscore';
import { expect } from 'chai';
import * as utils from '../build/utils';
import ApifyClient from '../build';
import { BASE_PATH } from '../build/crawlers';

const basicOptions = {
    protocol: 'http',
    host: 'myhost',
    basePath: '/mypath',
    port: 80,
};

const credentials = {
    userId: 'DummyUserId',
    token: 'DummyTokenXXXXX',
};

const optionsWithCredentials = Object.assign({}, basicOptions, credentials);

describe('Crawlers', () => {
    const requestPromiseMock = sinon.mock(utils, 'requestPromise');

    const requestExpectCall = (requestOpts, body, response) => {
        if (!_.isObject(requestOpts)) throw new Error('"requestOpts" parameter must be an object!');
        if (!requestOpts.method) throw new Error('"requestOpts.method" parameter is not set!');

        if (response) {
            requestPromiseMock
                .expects('requestPromise')
                .once()
                .withArgs(Promise, requestOpts, true)
                .returns(Promise.resolve({ body, response }));
        } else {
            requestPromiseMock
                .expects('requestPromise')
                .once()
                .withArgs(Promise, requestOpts)
                .returns(Promise.resolve(body));
        }
    };

    after(() => {
        requestPromiseMock.restore();
    });

    describe('List crawlers', () => {
        it('should throw if token is not provided', () => {
            const crawlerClient = new ApifyClient(basicOptions).crawlers;
            return expect(crawlerClient.listCrawlers.bind(crawlerClient, { userId: credentials.userId }))
                .to.throw('Missing required parameter: token');
        });

        it('should throw if userId is not Provided', () => {
            const crawlerClient = new ApifyClient(basicOptions).crawlers;
            return expect(crawlerClient.listCrawlers.bind(crawlerClient, { token: credentials.token }))
                .to.throw('Missing required parameter: userId');
        });

        it('should be able to use default userId/token', () => {
            requestExpectCall({
                json: true,
                method: 'GET',
                url: `http://myhost:80/mypath${BASE_PATH}/${credentials.userId}/crawlers`,
                qs: { token: credentials.token },
            });

            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;

            return crawlerClient.listCrawlers();
        });

        it('should override default userId/token with credentials passed as parameters', () => {
            requestExpectCall({
                json: true,
                method: 'GET',
                url: `http://myhost:80/mypath${BASE_PATH}/userIdParameter/crawlers`,
                qs: { token: 'tokenParameter' },
            });

            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;

            return crawlerClient.listCrawlers({ userId: 'userIdParameter', token: 'tokenParameter' });
        });

        it('should return what API returns', () => {
            const crawlersInResponse = [
                {
                    _id: 'wKw8QeHiHiyd8YGN8',
                    customId: 'Example_RSS',
                    createdAt: '2017-04-03T15:02:05.789Z',
                    modifiedAt: '2017-04-03T15:02:05.789Z',
                    executeUrl: 'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_RSS/execute?token=ptMAQuc52f6Q78keyuwmAEbWo',
                    lastExecution: null,
                    settingsUrl: 'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_RSS?token=itsrEEASPj4S2HjPdrxy7ntkY',
                    executionsListUrl: 'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_RSS/execs?token=Fmk3NMZtZbevqMHpSLafXaM2u',
                    lastExecutionFixedDetailsUrl:
                        'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_RSS/lastExec?token=Fmk3NMZtZbevqMHpSLafXaM2u',
                    lastExecutionFixedResultsUrl:
                        'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_RSS/lastExec/results?token=Fmk3NMZtZbevqMHpSLafXaM2u',
                },
                {
                    _id: 'EfEjTWAgnDGavzccq',
                    customId: 'Example_Hacker_News',
                    createdAt: '2017-04-03T15:02:05.789Z',
                    modifiedAt: '2017-04-03T15:02:05.789Z',
                    executeUrl: 'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_Hacker_News/execute?token=YLo2YBERtAMkyB9zEiufFxsWW',
                    lastExecution: {
                        _id: 'q8uunYKjdwkCTqRBq',
                        startedAt: '2017-05-11T14:55:46.352Z',
                        finishedAt: '2017-05-11T14:56:04.698Z',
                        status: 'SUCCEEDED',
                        pagesCrawled: 5,
                        detailsUrl: 'https://api.apifier.com/v1/execs/q8uunYKjdwkCTqRBq',
                        resultsUrl: 'https://api.apifier.com/v1/execs/q8uunYKjdwkCTqRBq/results',
                    },
                    settingsUrl: 'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_Hacker_News?token=itsrEEASPj4S2HjPdrxy7ntkY',
                    executionsListUrl:
                        'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_Hacker_News/execs?token=qmMrJooqaFTdiRktrnxexeoLN',
                    lastExecutionFixedDetailsUrl:
                        'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_Hacker_News/lastExec?token=qmMrJooqaFTdiRktrnxexeoLN',
                    lastExecutionFixedResultsUrl:
                        'https://api.apifier.com/v1/QKTX6JkmM9RLHGvZk/crawlers/Example_Hacker_News/lastExec/results?token=qmMrJooqaFTdiRktrnxexeoLN',
                },
            ];

            requestExpectCall({
                json: true,
                method: 'GET',
                url: `http://myhost:80/mypath${BASE_PATH}/${credentials.userId}/crawlers`,
                qs: { token: credentials.token },
            }, [].concat(crawlersInResponse));

            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;

            return crawlerClient.listCrawlers().then((crawlers) => {
                expect(crawlers).to.deep.equal(crawlersInResponse);
            });
        });
    });

    describe('Start Execution', () => {
        it('should throw if crawler parameter is missing', () => {
            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;
            return expect(crawlerClient.startCrawler.bind(crawlerClient)).to.throw('Missing required parameter: crawler');
        });

        it('should throw if token parameter is missing', () => {
            const crawlerClient = new ApifyClient(basicOptions).crawlers;
            return expect(crawlerClient.startCrawler.bind(crawlerClient, { crawler: 'dummyCrawler' })).to.throw('Missing required parameter: token');
        });

        it('should call the right url', () => {
            requestExpectCall({
                json: true,
                method: 'POST',
                url: `http://myhost:80/mypath${BASE_PATH}/${credentials.userId}/crawlers/dummyCrawler/execute`,
                qs: { token: credentials.token },
            });

            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;

            return crawlerClient.startCrawler({ crawler: 'dummyCrawler' });
        });

        it('should forward tag and wait parameters', () => {
            requestExpectCall({
                json: true,
                method: 'POST',
                url: `http://myhost:80/mypath${BASE_PATH}/${credentials.userId}/crawlers/dummyCrawler/execute`,
                qs: { token: credentials.token, tag: 'dummyTag', wait: 30 },
            });

            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;

            return crawlerClient.startCrawler({ crawler: 'dummyCrawler', tag: 'dummyTag', wait: 30 });
        });

        it('should return what API returns', () => {
            const apiResponse = {
                _id: 'bmqzTAPKHcYKGg9B6',
                actId: 'CwNxxSNdBYw7NWLjb',
                startedAt: '2017-05-18T12:36:35.833Z',
                finishedAt: null,
                status: 'RUNNING',
            };

            requestExpectCall({
                json: true,
                method: 'POST',
                url: `http://myhost:80/mypath${BASE_PATH}/${credentials.userId}/crawlers/dummyCrawler/execute`,
                qs: { token: credentials.token },
            }, Object.assign({}, apiResponse));

            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;

            return crawlerClient.startCrawler({ crawler: 'dummyCrawler' }).then((execution) => {
                expect(execution).to.deep.equal(apiResponse);
            });
        });

        it('should pass body parameters', () => {
            requestExpectCall({
                json: true,
                method: 'POST',
                url: `http://myhost:80/mypath${BASE_PATH}/${credentials.userId}/crawlers/dummyCrawler/execute`,
                qs: { token: credentials.token },
                body: {
                    timeout: 300,
                    customData: { a: 'b' },
                },
            });

            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;

            return crawlerClient.startCrawler({ crawler: 'dummyCrawler', timeout: 300, customData: { a: 'b' } });
        });

        it('should not pass invalid body parameters', () => {
            requestExpectCall({
                json: true,
                method: 'POST',
                url: `http://myhost:80/mypath${BASE_PATH}/${credentials.userId}/crawlers/dummyCrawler/execute`,
                qs: { token: credentials.token },
            });

            const crawlerClient = new ApifyClient(optionsWithCredentials).crawlers;

            return crawlerClient.startCrawler({ crawler: 'dummyCrawler', invalidParam: 300 });
        });
    });
});
