import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from './order';

interface EventIdentifier {
    id: string;
    version: number;
}

// props to create an Ticket
interface TicketAttributes {
    id: string;
    title: string;
    price: number;
}

// props that end up on an Ticket ( -> may be different to TicketAttributes)
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(ticketDetails: TicketAttributes): TicketDoc;
    findTicketNextInSequence(event: EventIdentifier): Promise<TicketDoc | null>;
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

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findTicketNextInSequence = (event: {
    id: string;
    version: number;
}) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1,
    });
};

ticketSchema.statics.build = (ticketDetails: TicketAttributes) => {
    return new Ticket({
        _id: ticketDetails.id,
        title: ticketDetails.title,
        price: ticketDetails.price,
    });
};

ticketSchema.methods.isReserved = async function () {
    const thisTicketDocumentInstance = this;

    const exisitingOrder = await Order.findOne({
        // @ts-ignore
        ticket: thisTicketDocumentInstance,
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
