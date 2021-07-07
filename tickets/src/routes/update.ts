import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import {
    requireAuth,
    validateRequest,
    NotAuthorisedError,
    NotFoundError,
    BadRequestError,
} from '@dr-wolf-at-npm/common-for-tix';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
    '/api/tickets/:id',
    requireAuth,
    [
        body('title').not().isEmpty().withMessage('A Title is required'),
        body('title').isString().withMessage('Title cannot be ot type Number'),
        body('title')
            .not()
            .isNumeric()
            .withMessage('Price cannot be of type Number'),
        body('price').not().isEmpty().withMessage('A Price is required'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be > $0.00'),
        body('price')
            .not()
            .isString()
            .withMessage('Price cannot be of type String'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id); //! req.params.id captures id from /:id

        console.log('Ticket version b4 save: ', ticket?.version);

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.userId != req.currentUser!.id) {
            throw new NotAuthorisedError();
        }

        if (ticket.orderId) {
            throw new BadRequestError('Cannot edit a reserved ticket');
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price,
        });

        await ticket.save();

        console.log('Ticket version after save: ', ticket?.version);

        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
        });

        res.send(ticket);
    },
);

export { router as updateTicketRouter };
