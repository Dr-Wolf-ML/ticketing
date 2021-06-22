import express, { Request, Response } from 'express';

import { requireAuth } from '@dr-wolf-at-npm/common-for-tix';

const router = express.Router();

router.delete(
    '/api/orders/:orderId',
    requireAuth,
    (req: Request, res: Response) => {
        console.log('Delete request to orders: ', req);

        res.send({});
    },
);

export { router as deleteOrderRouter };
