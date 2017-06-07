import { expect } from 'chai';
import ApifyClient from '../build';
import { BASE_PATH } from '../build/key_value_stores';
import { mockRequest, requestExpectCall, requestExpectErrorCall, verifyAndRestoreRequest } from './_helper';

const BASE_URL = 'http://exaple.com/something';
const OPTIONS = { baseUrl: BASE_URL };

describe('Key value store', () => {
    before(mockRequest);
    after(verifyAndRestoreRequest);

    describe('indentification', () => {
        it('should work with storeId in default params', () => {
            const storeId = 'some-id-2';

            requestExpectCall({
                json: true,
                method: 'GET',
                url: `${BASE_URL}${BASE_PATH}/${storeId}`,
            }, {
                data: {
                    id: storeId,
                },
            });

            const apifyClient = new ApifyClient(Object.assign({}, OPTIONS, { storeId }));

            return apifyClient
                .keyValueStores
                .getStore()
                .then((store) => {
                    expect(store.id).to.be.eql(storeId);
                });
        });

        it('should work with storeId in method call params', () => {
            const storeId = 'some-id-3';

            requestExpectCall({
                json: true,
                method: 'GET',
                url: `${BASE_URL}${BASE_PATH}/${storeId}`,
            }, {
                data: {
                    id: storeId,
                },
            });

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .getStore({ storeId })
                .then((store) => {
                    expect(store.id).to.be.eql(storeId);
                });
        });

        it('should work with token and storeName', () => {
            const storeId = 'some-id-4';
            const storeOptions = {
                token: 'sometoken',
                storeName: 'somename',
            };

            requestExpectCall({
                json: true,
                method: 'POST',
                url: `${BASE_URL}${BASE_PATH}`,
                qs: { name: storeOptions.storeName, token: storeOptions.token },
            }, {
                data: {
                    id: storeId,
                },
            });

            const apifyClient = new ApifyClient(Object.assign({}, OPTIONS, { storeId }));

            return apifyClient
                .keyValueStores
                .getOrCreateStore(storeOptions)
                .then(store => expect(store.id).to.be.eql(storeId));
        });
    });

    describe('REST method', () => {
        it('listStores() works', () => {
            const storeId = 'some-id';
            const callOptions = {
                token: 'sometoken',
                limit: 5,
                offset: 3,
            };

            const expected = {
                limit: 5,
                offset: 3,
                count: 5,
                total: 10,
                items: ['store1', 'store2'],
            };

            requestExpectCall({
                json: true,
                method: 'GET',
                url: `${BASE_URL}${BASE_PATH}`,
                qs: callOptions,
            }, {
                data: expected,
            });

            const apifyClient = new ApifyClient(Object.assign({}, OPTIONS, { storeId }));

            return apifyClient
                .keyValueStores
                .listStores(callOptions)
                .then(response => expect(response).to.be.eql(expected));
        });

        it('getStore() works', () => {
            const storeId = 'some-id';
            const expected = { _id: 'some-id', aaa: 'bbb' };

            requestExpectCall({
                json: true,
                method: 'GET',
                url: `${BASE_URL}${BASE_PATH}/${storeId}`,
            }, { data: expected });

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .getStore({ storeId })
                .then(given => expect(given).to.be.eql(expected));
        });

        it('getStore() returns null on 404 status code (RECORD_NOT_FOUND)', () => {
            const storeId = 'some-id';

            requestExpectErrorCall({
                json: true,
                method: 'GET',
                url: `${BASE_URL}${BASE_PATH}/${storeId}`,
            }, false, 404);

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .getStore({ storeId })
                .then(given => expect(given).to.be.eql(null));
        });

        it('deleteStore() works', () => {
            const storeId = 'some-id';

            requestExpectCall({
                json: true,
                method: 'DELETE',
                url: `${BASE_URL}${BASE_PATH}/${storeId}`,
            });

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .deleteStore({ storeId });
        });

        it('getRecord() works', () => {
            const key = 'some-key';
            const storeId = 'some-id';
            const body = 'sometext';
            const expected = {
                body,
                contentType: 'text/plain',
            };

            requestExpectCall({
                json: true,
                method: 'GET',
                url: `${BASE_URL}${BASE_PATH}/${storeId}/records/${key}`,
            }, { data: expected });

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .getRecord({ storeId, key })
                .then(given => expect(given).to.be.eql(expected));
        });

        it('getRecord() works with raw = true', () => {
            const key = 'some-key';
            const storeId = 'some-id';
            const body = 'sometext';
            const expected = {
                body,
                contentType: 'text/plain',
            };

            requestExpectCall({
                json: false,
                method: 'GET',
                qs: { raw: 1 },
                url: `${BASE_URL}${BASE_PATH}/${storeId}/records/${key}`,
            }, expected.body);

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .getRecord({ storeId, key, raw: true })
                .then(given => expect(given).to.be.eql(expected.body));
        });

        it('getRecord() returns null on 404 status code (RECORD_NOT_FOUND)', () => {
            const key = 'some-key';
            const storeId = 'some-id';

            requestExpectErrorCall({
                json: true,
                method: 'GET',
                url: `${BASE_URL}${BASE_PATH}/${storeId}/records/${key}`,
            }, false, 404);

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .getRecord({ storeId, key })
                .then(given => expect(given).to.be.eql(null));
        });

        it('put() works', () => {
            const key = 'some-key';
            const storeId = 'some-id';
            const contentType = 'application/json';
            const body = 'someValue';

            requestExpectCall({
                body: 'someValue',
                headers: { 'Content-Type': 'application/json' },
                json: false,
                method: 'PUT',
                url: `${BASE_URL}${BASE_PATH}/${storeId}/records/${key}`,
            });

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .putRecord({ storeId, key, contentType, body });
        });

        it('delete() works', () => {
            const key = 'some-key';
            const storeId = 'some-id';

            requestExpectCall({
                json: true,
                method: 'DELETE',
                url: `${BASE_URL}${BASE_PATH}/${storeId}/records/${key}`,
            });

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .deleteRecord({ storeId, key });
        });

        it('listKeys() works', () => {
            const storeId = 'some-id';
            const exclusiveStartKey = 'fromKey';
            const limit = 10;
            const expected = 'something';

            requestExpectCall({
                json: true,
                method: 'GET',
                qs: { limit, exclusiveStartKey },
                url: `${BASE_URL}${BASE_PATH}/${storeId}/keys`,
            }, { data: expected });

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .listKeys({ storeId, exclusiveStartKey, limit })
                .then(response => expect(response).to.be.eql(expected));
        });

        it('listRecords() works', () => {
            const storeId = 'some-id';
            const exclusiveStartKey = 'fromKey';
            const limit = 10;
            const expected = 'something';

            requestExpectCall({
                json: true,
                method: 'GET',
                qs: { limit, exclusiveStartKey },
                url: `${BASE_URL}${BASE_PATH}/${storeId}/records`,
            }, { data: expected });

            const apifyClient = new ApifyClient(OPTIONS);

            return apifyClient
                .keyValueStores
                .listRecords({ storeId, exclusiveStartKey, limit })
                .then(response => expect(response).to.be.eql(expected));
        });
    });
});
