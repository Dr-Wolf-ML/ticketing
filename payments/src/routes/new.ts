import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { stripe } from '../stripe';

import {
    requireAuth,
    validateRequest,
    BadRequestError,
    NotAuthorisedError,
    NotFoundError,
    OrderStatus,
} from '@dr-wolf-at-npm/common-for-tix';

import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [
        body('token').not().isEmpty().withMessage('Token is required'),
        body('orderId').not().isEmpty().withMessage('OrderId is required'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        // check if order exists
        if (!order) {
            throw new NotFoundError();
        }

        // check if userId in order matches currentUser
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorisedError();
        }

        // check that order is not cancelled
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for a cancelled order.');
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token,
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });

        await payment.save();

        const receipt = {
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        };

        await new PaymentCreatedPublisher(natsWrapper.client).publish(receipt);

        res.status(201).send(receipt);
    }
);

export { router as createChargeRouter };
