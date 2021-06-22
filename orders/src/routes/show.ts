import express, { Request, Response } from 'express';

import { requireAuth } from '@dr-wolf-at-npm/common-for-tix';

const router = express.Router();

router.get(
    '/api/orders/:orderId',
    requireAuth,
    (req: Request, res: Response) => {
        console.log('Get request to orders show: ', req);

        res.send({});
    },
);

export { router as showOrderRouter };
