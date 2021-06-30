import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import {
    requireAuth,
    BadRequestError,
    NotFoundError,
    NotAuthorisedError,
    OrderStatus,
} from '@dr-wolf-at-npm/common-for-tix';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.patch(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new BadRequestError('Invalid Order ID');
        }

        const order = await Order.findById(orderId).populate('ticket');

        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorisedError();
        }

        order.status = OrderStatus.Cancelled;

        await order.save();

        // publish event:  order cancelled
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        res.status(202).send(order);
    },
);

export { router as cancelOrderRouter };
