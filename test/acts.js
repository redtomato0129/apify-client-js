import _ from 'underscore';
import { expect } from 'chai';
import ApifyClient from '../build';
import { BASE_PATH } from '../build/acts';
import { mockRequest, requestExpectCall, requestExpectErrorCall, verifyAndRestoreRequest } from './_helper';

const BASE_URL = 'http://exaple.com/something';
const OPTIONS = { baseUrl: BASE_URL };

describe('Act method', () => {
    before(mockRequest);
    after(verifyAndRestoreRequest);

    it('listActs() works', () => {
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
            items: ['act1', 'act2'],
        };

        requestExpectCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}`,
            qs: callOptions,
        }, {
            data: expected,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .listActs(callOptions)
            .then(response => expect(response).to.be.eql(expected));
    });

    it('createAct() works', () => {
        const act = { foo: 'bar' };
        const token = 'some-token';

        requestExpectCall({
            json: true,
            method: 'POST',
            url: `${BASE_URL}${BASE_PATH}`,
            qs: { token },
            body: act,
        }, {
            data: act,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .createAct({ act, token })
            .then(response => expect(response).to.be.eql(act));
    });

    it('updateAct() works with both actId parameter and actId in act object', () => {
        const actId = 'some-id';
        const act = { id: actId, foo: 'bar' };
        const token = 'some-token';

        requestExpectCall({
            json: true,
            method: 'PUT',
            url: `${BASE_URL}${BASE_PATH}/${actId}`,
            qs: { token },
            body: _.omit(act, 'id'),
        }, {
            data: act,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .updateAct({ actId, act, token })
            .then(response => expect(response).to.be.eql(act));
    });

    it('updateAct() works with actId in act object', () => {
        const actId = 'some-id';
        const act = { id: actId, foo: 'bar' };
        const token = 'some-token';

        requestExpectCall({
            json: true,
            method: 'PUT',
            url: `${BASE_URL}${BASE_PATH}/${actId}`,
            qs: { token },
            body: _.omit(act, 'id'),
        }, {
            data: act,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .updateAct({ act, token })
            .then(response => expect(response).to.be.eql(act));
    });

    it('updateAct() works with actId parameter', () => {
        const actId = 'some-id';
        const act = { foo: 'bar' };
        const token = 'some-token';

        requestExpectCall({
            json: true,
            method: 'PUT',
            url: `${BASE_URL}${BASE_PATH}/${actId}`,
            qs: { token },
            body: act,
        }, {
            data: act,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .updateAct({ actId, act, token })
            .then(response => expect(response).to.be.eql(act));
    });

    it('getAct() works', () => {
        const actId = 'some-id';
        const act = { id: actId, foo: 'bar' };
        const token = 'some-token';

        requestExpectCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}/${actId}`,
            qs: { token },
        }, {
            data: act,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .getAct({ actId, token })
            .then(response => expect(response).to.be.eql(act));
    });

    it('getAct() returns null on 404 status code (RECORD_NOT_FOUND)', () => {
        const actId = 'some-id';
        const token = 'some-token';

        requestExpectErrorCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}/${actId}`,
            qs: { token },
        }, false, 404);

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .getAct({ actId, token })
            .then(given => expect(given).to.be.eql(null));
    });

    it('deleteAct() works', () => {
        const actId = 'some-id';
        const token = 'some-token';

        requestExpectCall({
            json: true,
            method: 'DELETE',
            url: `${BASE_URL}${BASE_PATH}/${actId}`,
            qs: { token },
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .deleteAct({ actId, token });
    });

    it('listRuns() works', () => {
        const actId = 'some-id';

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
            items: ['run1', 'run2'],
        };

        requestExpectCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}/${actId}/runs`,
            qs: callOptions,
        }, {
            data: expected,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .listRuns(Object.assign({}, callOptions, { actId }))
            .then(response => expect(response).to.be.eql(expected));
    });

    it('runAct() works', () => {
        const actId = 'some-id';
        const token = 'some-token';
        const contentType = 'some-type';
        const body = 'some-body';
        const run = { foo: 'bar' };
        const apiResponse = JSON.stringify({ data: run });

        requestExpectCall({
            method: 'POST',
            url: `${BASE_URL}${BASE_PATH}/${actId}/runs`,
            qs: { token },
            headers: {
                'Content-Type': contentType,
            },
            body,
        }, apiResponse);

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .runAct({ actId, token, contentType, body })
            .then(response => expect(response).to.be.eql(run));
    });

    it('runAct() stringifies JSON', () => {
        const actId = 'some-id';
        const token = 'some-token';
        const contentType = 'application/json';
        const body = { something: 'else' };
        const run = { foo: 'bar' };
        const apiResponse = JSON.stringify({ data: run });

        requestExpectCall({
            method: 'POST',
            url: `${BASE_URL}${BASE_PATH}/${actId}/runs`,
            qs: { token },
            headers: {
                'Content-Type': contentType,
            },
            body: JSON.stringify(body),
        }, apiResponse);

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .runAct({ actId, token, contentType, body })
            .then(response => expect(response).to.be.eql(run));
    });

    it('runAct() don\'t stringify JSON when useRawBody = true', () => {
        const actId = 'some-id';
        const token = 'some-token';
        const contentType = 'application/json';
        const body = '{"something":"else"}';
        const run = { foo: 'bar' };
        const apiResponse = JSON.stringify({ data: run });

        requestExpectCall({
            method: 'POST',
            url: `${BASE_URL}${BASE_PATH}/${actId}/runs`,
            qs: { token },
            headers: {
                'Content-Type': contentType,
            },
            body,
        }, apiResponse);

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .runAct({ actId, token, contentType, body, useRawBody: true })
            .then(response => expect(response).to.be.eql(run));
    });

    it('getRun() works', () => {
        const actId = 'some-act-id';
        const runId = 'some-run-id';
        const token = 'some-token';
        const run = { foo: 'bar' };

        requestExpectCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}/${actId}/runs/${runId}`,
            qs: { token },
        }, {
            data: run,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .getRun({ actId, token, runId })
            .then(response => expect(response).to.be.eql(run));
    });

    it('getRun() returns null on 404 status code (RECORD_NOT_FOUND)', () => {
        const actId = 'some-act-id';
        const runId = 'some-run-id';
        const token = 'some-token';

        requestExpectErrorCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}/${actId}/runs/${runId}`,
            qs: { token },
        }, false, 404);

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .getRun({ actId, runId, token })
            .then(given => expect(given).to.be.eql(null));
    });

    it('listBuilds() works', () => {
        const actId = 'some-id';

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
            items: ['build1', 'build2'],
        };

        requestExpectCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}/${actId}/builds`,
            qs: callOptions,
        }, {
            data: expected,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .listBuilds(Object.assign({}, callOptions, { actId }))
            .then(response => expect(response).to.be.eql(expected));
    });

    it('buildAct() works', () => {
        const actId = 'some-id';
        const token = 'some-token';
        const build = { foo: 'bar' };

        requestExpectCall({
            json: true,
            method: 'POST',
            url: `${BASE_URL}${BASE_PATH}/${actId}/builds`,
            qs: { token },
        }, {
            data: build,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .buildAct({ actId, token })
            .then(response => expect(response).to.be.eql(build));
    });

    it('getBuild() works', () => {
        const actId = 'some-act-id';
        const buildId = 'some-build-id';
        const token = 'some-token';
        const build = { foo: 'bar' };

        requestExpectCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}/${actId}/builds/${buildId}`,
            qs: { token },
        }, {
            data: build,
        });

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .getBuild({ actId, token, buildId })
            .then(response => expect(response).to.be.eql(build));
    });

    it('getBuild() returns null on 404 status code (RECORD_NOT_FOUND)', () => {
        const actId = 'some-act-id';
        const buildId = 'some-build-id';
        const token = 'some-token';

        requestExpectErrorCall({
            json: true,
            method: 'GET',
            url: `${BASE_URL}${BASE_PATH}/${actId}/builds/${buildId}`,
            qs: { token },
        }, false, 404);

        const apifyClient = new ApifyClient(OPTIONS);

        return apifyClient
            .acts
            .getBuild({ actId, buildId, token })
            .then(given => expect(given).to.be.eql(null));
    });
});
