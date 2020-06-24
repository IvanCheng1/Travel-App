const request = require('supertest')
const app = require('../server/server')

test('Getting root page and geo api page', async() => {

    await request(app)
        .get('/')
        .then(res => {
            expect(res.statusCode).toBe(200)
        })

    await request(app)
        .post('/geo')
        .send({
            city: 'Hong Kong',
            country: ''
        })
        .then(res => {
            expect(res.statusCode).toEqual(200)
        })

});