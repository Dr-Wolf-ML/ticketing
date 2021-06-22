import express, { Request, Response } from 'express';

import { requireAuth, OrderStatus } from '@dr-wolf-at-npm/common-for-tix';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
    const activeOrders = await Order.find({
        userId: req.currentUser!.id,
    }).populate('ticket');

    res.send({ activeOrders });
});

export { router as indexOrderRouter };
