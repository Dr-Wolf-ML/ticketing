import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import {
    requireAuth,
    BadRequestError,
    NotFoundError,
    NotAuthorisedError,
} from '@dr-wolf-at-npm/common-for-tix';
import { Order } from '../models/order';

const router = express.Router();

router.get(
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

        res.send(order);
    },
);

export { router as showOrderRouter };
