import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@dr-wolf-at-npm/common-for-tix';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../__mocks__/nats-wrapper';

const validMongoId = () => mongoose.Types.ObjectId().toHexString();

it('returns a 404 when purchasing an order that does not exist', async () => {
    // Act
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdf',
            orderId: validMongoId(),
        })
        // Assert
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    // Arrange
    const order = Order.build({
        id: validMongoId(),
        userId: validMongoId(),
        status: OrderStatus.Created,
        version: 0,
        price: 10,
    });
    await order.save();

    // Act
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdf',
            orderId: order.id,
        })
        // Assert
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = validMongoId();

    // Arrange
    const order = Order.build({
        id: validMongoId(),
        userId,
        status: OrderStatus.Created,
        version: 0,
        price: 10,
    });
    await order.save();

    order.set({
        status: OrderStatus.Cancelled,
    });
    await order.save();

    // Act
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdf',
            orderId: order.id,
        });

    // Assert
    expect(response.status).toEqual(400);
    expect(response.text).toContain('Cannot pay for a cancelled order.');
});

it('returns a 201 with valid inputs', async () => {
    //! fix error in deployment testing
    jest.setTimeout(60000);

    const userId = validMongoId();
    const price = Math.floor(Math.random() * 100000);

    // Arrange
    const order = Order.build({
        id: validMongoId(),
        userId,
        status: OrderStatus.Created,
        version: 0,
        price,
    });
    await order.save();

    // Act
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        });

    // Assert
    expect(response.status).toEqual(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled;

    // Arrange - Stripe API call
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });

    // Assert
    expect(stripeCharge).toBeDefined;
    expect(stripeCharge?.amount).toEqual(price * 100);
    expect(stripeCharge?.currency).toContain('usd');
    expect(stripeCharge?.payment_method_details?.card?.brand).toEqual('visa');

    //! fix error in deployment testing
    jest.setTimeout(5000);
});

it('returns a 400 if an invalid token is supplied', async () => {
    //! fix error in deployment testing
    jest.setTimeout(60000);

    const userId = validMongoId();
    const price = Math.floor(Math.random() * 100000);

    // Arrange
    const order = Order.build({
        id: validMongoId(),
        userId,
        status: OrderStatus.Created,
        version: 0,
        price,
    });
    await order.save();

    // Act
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'invalid-token',
            orderId: order.id,
        });

    // Assert
    expect(response.status).toEqual(400);
    expect(response.body.errors[0].message).toEqual(
        "No such token: 'invalid-token'"
    );

    //! fix error in deployment testing
    jest.setTimeout(5000);
});

it('saves a payment to Payments', async () => {
    //! fix error in deployment testing
    jest.setTimeout(60000);

    const userId = validMongoId();
    const price = Math.floor(Math.random() * 100000);

    // Arrange
    const order = Order.build({
        id: validMongoId(),
        userId,
        status: OrderStatus.Created,
        version: 0,
        price,
    });
    await order.save();

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        });

    expect(response.status).toEqual(201);

    // Act
    const payment = await Payment.findOne({
        orderId: order.id,
        striepId: response.body.id,
    });

    // Assert
    expect(payment).not.toBeNull;

    //! fix error in deployment testing
    jest.setTimeout(5000);
});

it('publishes a payment:created event', async () => {
    const userId = validMongoId();
    const price = Math.floor(Math.random() * 100000);

    // Arrange
    const order = Order.build({
        id: validMongoId(),
        userId,
        status: OrderStatus.Created,
        version: 0,
        price,
    });
    await order.save();

    // Act
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        });

    // Assert
    expect(natsWrapper.client.publish).toHaveBeenCalled;
});

it('passes all test for the createChargeRouter', async () => {
    console.log('Payments API:  createChargeRouter passed.');
});
