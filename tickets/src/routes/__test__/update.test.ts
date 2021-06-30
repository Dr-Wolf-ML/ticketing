import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id is does not exist', async () => {
    //* Arrange
    const newRandomlyGeneratedTicketId =
        new mongoose.Types.ObjectId().toHexString();

    //* Act
    const response = await request(app)
        .put(`/api/tickets/${newRandomlyGeneratedTicketId}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Test Title',
            price: 10,
        });

    //* Assert
    expect(response.statusCode).toEqual(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    //* Arrange
    const newRandomlyGeneratedTicketId =
        new mongoose.Types.ObjectId().toHexString();

    //* Act
    const response = await request(app)
        .put(`/api/tickets/${newRandomlyGeneratedTicketId}`)
        //! .set('Cookie', global.signin())
        .send({
            title: 'Test Title',
            price: 10,
        });

    //* Assert
    expect(response.statusCode).toEqual(401);
});

it("(1) returns a 401 if the user does not own the ticket and (2) doesn't change the original ticket", async () => {
    //* Arrange
    const orignalTitle = 'Test Title';
    const originalPrice = 10;

    // create a ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin()) // sets new random ID
        .send({
            title: orignalTitle,
            price: originalPrice,
        })
        .expect(201);

    //* Act
    const response2 = await request(app)
        .put(`/api/tickets/${response1.body.id}`)
        .set('Cookie', global.signin()) // sets new random ID
        .send({
            title: `Updated ${orignalTitle}`,
            price: originalPrice + 10,
        });

    //* Assert #1
    expect(response2.status).toEqual(401);

    //* Arrange
    // ensure ensure original ticket was not changed
    const findTicketResponse = await request(app)
        .get(`/api/tickets/${response1.body.id}`)
        .send()
        .expect(200);

    //* Assert #2
    expect(findTicketResponse.body.title).toEqual(orignalTitle);
    expect(findTicketResponse.body.price).toEqual(originalPrice);
});

it('returns a 400 if the user provides and invalid title or price', async () => {
    //* Arrange
    const orignalTitle = 'Test Title';
    const originalPrice = 10;

    const cookie = global.signin();

    // create a ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: orignalTitle,
            price: originalPrice,
        })
        .expect(201);

    // make a test update request (including wrong types)
    interface MakeTestUpdate {
        title: string | number | null;
        price: string | number | null;
        assertion: number;
    }

    const makeUpdate = ({ title, price, assertion }: MakeTestUpdate) => {
        return (
            //* Act
            request(app)
                .put(`/api/tickets/${response1.body.id}`)
                .set('Cookie', cookie)
                .send({
                    title,
                    price,
                })
                //* Assert
                .expect(assertion)
        );
    };

    //* Act & Assert
    await makeUpdate({ title: '', price: 20, assertion: 400 });
    await makeUpdate({ title: null, price: 20, assertion: 400 });
    await makeUpdate({ title: 41, price: 20, assertion: 400 });
    await makeUpdate({ title: `Updated`, price: -10, assertion: 400 });
    await makeUpdate({ title: `Updated`, price: null, assertion: 400 });
    await makeUpdate({ title: `Updated`, price: '10', assertion: 400 });
});

it('updates the ticket provided valid inputs and returns a 200', async () => {
    //* Arrange
    const cookie = global.signin();

    // create a ticket
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Test Title',
            price: 10,
        })
        .expect(201);

    // check title and price
    const foundOriginalTicket = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    //* Assert
    expect(foundOriginalTicket.body.title).toEqual('Test Title');
    expect(foundOriginalTicket.body.price).toEqual(10);

    //* Act
    const response2 = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Updated Test Title',
            price: 20,
        })
        //* Assert
        .expect(200);

    //* Arrange
    // ensure ensure original ticket was changed
    const foundUpdatedTicket = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    //* Assert
    expect(foundUpdatedTicket.body.title).toEqual('Updated Test Title');
    expect(foundUpdatedTicket.body.price).toEqual(20);
});

it('publishes an update ticket event', async () => {
    //* Arrange
    const cookie = global.signin();

    // create a ticket
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Test Title',
            price: 10,
        })
        .expect(201);

    //* Act
    // update ticket
    const response2 = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Updated Test Title',
            price: 20,
        })
        //* Assert
        .expect(200);

    // Assert
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toBeCalledTimes(2);
    expect(natsWrapper.client.publish).toHaveBeenNthCalledWith(
        2,
        'ticket:updated',
        expect.any(String),
        expect.any(Function),
    );
    expect(natsWrapper.client.publish).toHaveBeenNthCalledWith(
        2,
        'ticket:updated',
        `{\"id\":\"${response2.body.id}\",\"version\":${response2.body.version},\"title\":\"${response2.body.title}",\"price\":${response2.body.price},\"userId\":\"${response2.body.userId}\"}`,
        expect.any(Function),
    );
});

it('passes all test for the updateTicketRouter', async () => {
    console.log('Tickets API:  updateTicketRouter passed.');
});
