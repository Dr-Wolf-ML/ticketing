import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import {
    requireAuth,
    validateRequest,
    NotFoundError,
    BadRequestError,
    OrderStatus,
} from '@dr-wolf-at-npm/common-for-tix';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { currentUser } from '@dr-wolf-at-npm/common-for-tix';

const router = express.Router();

// set the time b4 a ticket reservation expires unless paid
const TIME_B4_EXPIRATION_SECONDS = 15 * 60; // 15 mins

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('Ticket ID must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;
        // find the ticket the user is trying to order
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }

        // make sure the ticket is not already reserved
        const isReserved = await ticket.isReserved();

        if (isReserved) {
            throw new BadRequestError('Ticket already reserved.');
        }

        // calculate and expiration date for this order (15 mins)
        const expiration = new Date();
        expiration.setSeconds(
            expiration.getSeconds() + TIME_B4_EXPIRATION_SECONDS,
        );

        // build the order and save it to the database
        const order = Order.build({
            // @ts-ignore
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket,
        });

        await order.save();

        // publish event:  order created

        res.status(201).send(order);
    },
);

export { router as createOrderRouter };
