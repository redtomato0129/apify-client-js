const ApifyClient = require('../src');
const mockServer = require('./mock_server/server');
const { Browser, validateRequest, DEFAULT_QUERY } = require('./_helper');

describe('Dataset methods', () => {
    let baseUrl;
    const browser = new Browser();

    beforeAll(async () => {
        const server = await mockServer.start();
        await browser.start();
        baseUrl = `http://localhost:${server.address().port}`;
    });

    afterAll(async () => {
        await Promise.all([
            mockServer.close(),
            browser.cleanUpBrowser(),
        ]);
    });

    let client;
    let page;
    beforeEach(async () => {
        page = await browser.getInjectedPage(baseUrl, DEFAULT_QUERY);
        client = new ApifyClient({
            baseUrl,
            maxRetries: 0,
            ...DEFAULT_QUERY,
        });
    });
    afterEach(async () => {
        client = null;
        page.close().catch(() => {});
    });

    describe('datasets()', () => {
        test('list() works', async () => {
            const opts = {
                limit: 5,
                offset: 3,
                desc: true,
                unnamed: true,
            };

            const res = await client.datasets().list(opts);
            expect(res.id).toEqual('list-datasets');
            validateRequest(opts);

            const browserRes = await page.evaluate((options) => client.datasets().list(options), opts);
            expect(browserRes).toEqual(res);
            validateRequest(opts);
        });

        test('getOrCreate() works', async () => {
            const name = 'some-id-2';

            const res = await client.datasets().getOrCreate(name);
            expect(res.id).toEqual('get-or-create-dataset');
            validateRequest({ name });

            const browserRes = await page.evaluate((n) => client.datasets().getOrCreate(n), name);
            expect(browserRes).toEqual(res);
            validateRequest({ name });
        });
    });

    describe('dataset(id)', () => {
        test('get() works', async () => {
            const datasetId = 'some-id';

            const res = await client.dataset(datasetId).get();
            expect(res.id).toEqual('get-dataset');
            validateRequest({}, { datasetId });

            const browserRes = await page.evaluate((id) => client.dataset(id).get(), datasetId);
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId });
        });

        test('get() returns undefined on 404 status code (RECORD_NOT_FOUND)', async () => {
            const datasetId = '404';

            const res = await client.dataset(datasetId).get();
            expect(res).toBeUndefined();
            validateRequest({}, { datasetId });

            const browserRes = await page.evaluate((id) => client.dataset(id).get(), datasetId);
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId });
        });

        test('delete() works', async () => {
            const datasetId = '204';
            const res = await client.dataset(datasetId).delete();
            expect(res).toBeUndefined();
            validateRequest({}, { datasetId });

            const browserRes = await page.evaluate((id) => client.dataset(id).delete(), datasetId);
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId });
        });

        test('update() works', async () => {
            const datasetId = 'some-id';
            const dataset = { name: 'my-name' };

            const res = await client.dataset(datasetId).update(dataset);
            expect(res.id).toEqual('update-dataset');
            validateRequest({}, { datasetId }, dataset);

            const browserRes = await page.evaluate((id, opts) => client.dataset(id).update(opts), datasetId, dataset);
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId }, dataset);
        });

        test('listItems() works', async () => {
            const datasetId = 'some-id';
            const expected = {
                total: 0,
                offset: 0,
                count: 0,
                limit: 100000,
                items: [],
            };
            const query = {
                fields: ['one', 'two'],
                omit: ['x'],
                desc: true,
            };
            const responseHeaders = {
                'content-type': 'application/json; chartset=utf-8',
                'x-apify-pagination-total': '0',
                'x-apify-pagination-offset': '0',
                'x-apify-pagination-count': '1', // wrong on purpose to check that it's not used
                'x-apify-pagination-limit': '100000',
            };
            mockServer.setResponse({ body: [], headers: responseHeaders });

            const res = await client.dataset(datasetId).listItems(query);
            expect(res).toEqual(expected);
            validateRequest(query, { datasetId });

            const browserRes = await page.evaluate((id, opts) => client.dataset(id).listItems(opts), datasetId, query);
            expect(browserRes).toEqual(res);
            validateRequest(query, { datasetId });
        });

        // TODO maybe use for .export()?
        test.skip('getItems() works with bom=false', async () => {
            const datasetId = 'some-id';
            const expected = {
                total: 0,
                offset: 0,
                count: 0,
                limit: 100000,
                items: [],
            };
            const headers = {
                'content-type': 'application/json; chartset=utf-8',
                'x-apify-pagination-total': '0',
                'x-apify-pagination-offset': '0',
                'x-apify-pagination-count': '0',
                'x-apify-pagination-limit': '100000',
            };
            mockServer.setResponse({ body: [], headers });
            const qs = { bom: 0, format: 'csv', delimiter: ';', fields: 'a,b', omit: 'c,d' };

            const options = {
                datasetId,
                bom: false,
                fields: ['a', 'b'],
                omit: ['c', 'd'],
                format: 'csv',
                delimiter: ';',
            };

            const res = await client.dataset(datasetId).getItems(options);
            expect(res).toEqual(expected);
            validateRequest(qs, { datasetId }, {});

            const browserRes = await page.evaluate((opts) => client.dataset(datasetId).getItems(opts), { datasetId });
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId }, {});
        });

        test('listItems() limit and offset work', async () => {
            const datasetId = 'some-id';
            const body = [{ test: 'value' }];
            const expected = {
                total: 1,
                offset: 1,
                count: 1,
                limit: 1,
                items: body,
            };
            const headers = {
                'content-type': 'application/json; chartset=utf-8',
                'x-apify-pagination-total': '1',
                'x-apify-pagination-offset': '1',
                'x-apify-pagination-count': '0',
                'x-apify-pagination-limit': '1',
            };
            const qs = { limit: 1, offset: 1 };
            mockServer.setResponse({ body, headers });

            const res = await client.dataset(datasetId).listItems(qs);
            expect(res).toEqual(expected);
            validateRequest(qs, { datasetId });

            const browserRes = await page.evaluate((id, opts) => client.dataset(id).listItems(opts), datasetId, qs);
            expect(browserRes).toEqual(res);
            validateRequest(qs, { datasetId });
        });

        // TODO maybe use for .export()?
        test.skip('getItems() parses JSON', async () => {
            const datasetId = 'some-id';
            const body = JSON.stringify([{ a: 'foo', b: ['bar1', 'bar2'] }]);
            const contentType = 'application/json';
            const expected = {
                total: 1,
                offset: 0,
                count: 1,
                limit: 100000,
                items: JSON.parse(body),
            };
            const headers = {
                'content-type': contentType,
                'x-apify-pagination-total': '1',
                'x-apify-pagination-offset': '0',
                'x-apify-pagination-count': '1',
                'x-apify-pagination-limit': '100000',
            };
            mockServer.setResponse({ body: expected.items, headers });

            const res = await client.dataset(datasetId).getItems({ datasetId });
            expect(res).toEqual(expected);
            validateRequest({}, { datasetId });

            const browserRes = await page.evaluate((options) => client.dataset(datasetId).getItems(options), { datasetId });
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId });
        });

        // TODO maybe use for .export()?
        test.skip('getItems() doesn\'t parse application/json when disableBodyParser = true', async () => {
            const datasetId = 'some-id';
            const body = JSON.stringify({ a: 'foo', b: ['bar1', 'bar2'] });
            const contentType = 'application/json';
            const expected = {
                total: 1,
                offset: 0,
                count: 1,
                limit: 100000,
                items: body,
            };
            const headers = {
                'content-type': contentType,
                'x-apify-pagination-total': '1',
                'x-apify-pagination-offset': '0',
                'x-apify-pagination-count': '1',
                'x-apify-pagination-limit': '100000',
            };
            mockServer.setResponse({ body: expected.items, headers });

            const res = await client.dataset(datasetId).getItems({ datasetId });
            expect(res).toEqual(expected);
            validateRequest({}, { datasetId });

            const browserRes = await page.evaluate((options) => client.dataset(datasetId).getItems(options), { datasetId });
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId });
        });

        test('pushItems() works with object', async () => {
            const datasetId = '201';
            const data = { someData: 'someValue' };

            const res = await client.dataset(datasetId).pushItems(data);
            expect(res).toBeUndefined();
            validateRequest({}, { datasetId }, data);

            const browserRes = await page.evaluate((id, items) => client.dataset(id).pushItems(items), datasetId, data);
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId }, data);
        });

        test('pushItems() works with array', async () => {
            const datasetId = '201';
            const data = [{ someData: 'someValue' }, { someData: 'someValue' }];

            const res = await client.dataset(datasetId).pushItems(data);
            expect(res).toBeUndefined();
            validateRequest({}, { datasetId }, data);

            const browserRes = await page.evaluate((id, items) => client.dataset(id).pushItems(items), datasetId, data);
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId }, data);
        });

        test('pushItems() works with string', async () => {
            const datasetId = '201';
            const data = JSON.stringify([{ someData: 'someValue' }, { someData: 'someValue' }]);

            const res = await client.dataset(datasetId).pushItems(data);
            expect(res).toBeUndefined();
            validateRequest({}, { datasetId }, JSON.parse(data));

            const browserRes = await page.evaluate((id, options) => client.dataset(id).pushItems(options), datasetId, data);
            expect(browserRes).toEqual(res);
            validateRequest({}, { datasetId }, JSON.parse(data));
        });

        test('pushItems() compresses large request in Node.js', async () => {
            const datasetId = '201';
            const chunk = { someData: 'someValue' };
            const data = Array(200).fill(chunk);

            const expectedHeaders = {
                'content-type': 'application/json; charset=utf-8',
                'content-encoding': 'gzip',
            };

            const res = await client.dataset(datasetId).pushItems(data);
            expect(res).toBeUndefined();
            validateRequest({}, { datasetId }, data, expectedHeaders);
        });
    });
});
