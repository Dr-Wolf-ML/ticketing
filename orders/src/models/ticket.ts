import mongoose from 'mongoose';

import { Order, OrderStatus } from './order';

// props to create an Ticket
interface TicketAttributes {
    title: string;
    price: number;
}

// props that end up on an Ticket ( -> may be different to TicketAttributes)
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(ticketDetails: TicketAttributes): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    },
);

ticketSchema.statics.build = (ticketDetails: TicketAttributes) => {
    return new Ticket(ticketDetails);
};

ticketSchema.methods.isReserved = async function () {
    const exisitingOrder = await Order.findOne({
        // this === the ticket document
        //! @ts-ignore - why ??
        // @ts-ignore
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete,
            ],
        },
    });

    return !!exisitingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
