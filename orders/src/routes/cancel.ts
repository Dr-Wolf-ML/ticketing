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

const router = express.Router();

router.patch(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new BadRequestError('Invalid Order ID');
        }

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorisedError();
        }

        order.status = OrderStatus.Cancelled;

        await order.save();

        res.status(202).send(order);
    },
);

export { router as cancelOrderRouter };
