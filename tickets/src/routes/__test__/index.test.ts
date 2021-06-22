import request from 'supertest';

import { app } from '../../app';

const createTicket = () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'TestTicket',
            price: 40,
        });
};

it('can fetch a list of tickets', async () => {
    //* Arrange
    await createTicket();
    await createTicket();
    await createTicket();

    //* Act
    const response = await request(app).get('/api/tickets').send();

    //* Assert
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(3);
});

it('passes all test for the indexTicketRouter', async () => {
    console.log('Tickets API:  indexTicketRouter passed.');
});
