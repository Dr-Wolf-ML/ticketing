import express, { Request, Response } from 'express';

import { NotFoundError } from '@dr-wolf-at-npm/common-for-tix';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id); //! req.params.id captures id from /:id

    if (!ticket) {
        throw new NotFoundError();
    }

    res.send(ticket);
});

export { router as showTicketRouter };
