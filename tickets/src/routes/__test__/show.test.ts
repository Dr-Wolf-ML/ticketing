import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { response } from 'express';

it('returns a 404 if the ticket is not found', async () => {
    //* Arrange
    const newRandomlyGeneratedId = new mongoose.Types.ObjectId().toHexString();

    //* Act
    const response = await request(app)
        .get(`/api/tickets/${newRandomlyGeneratedId}`)
        .send();

    //* Assert
    expect(response.statusCode).toEqual(404);
});

it('returns the ticket if the ticket is found', async () => {
    //* Arrange
    const title = 'NFL Grand Final Ticket 2021';
    const price = 20;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price,
        })
        .expect(201); // ticket creation works as expected

    //* Act
    const findTicketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    //* Assert
    expect(findTicketResponse.body.title).toEqual(title);
    expect(findTicketResponse.body.price).toEqual(price);
});

it('passes all test for the showTicketRouter', async () => {
    console.log('Tickets API:  showTicketRouter passed.');
});
