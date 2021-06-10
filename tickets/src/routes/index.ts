import express, { Request, Response } from 'express';

import { NotFoundError } from '@dr-wolf-at-npm/common-for-tix';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
    const tickets = await Ticket.find({});

    if (!tickets) {
        throw new NotFoundError();
    }

    res.send(tickets);
});

export { router as indexTicketRouter };
