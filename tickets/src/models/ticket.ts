import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// Attributes required to create a new Ticket
interface TicketAttributes {
    title: string;
    price: number;
    userId: string;
}

// describes the props of a Ticket document (a record in MongoDB)
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
    wasPurchased?: string;
}

// describes the props of a Ticket model with added .build function
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
        },
        userId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
            required: false,
        },
        wasPurchased: {
            type: Date,
            required: false,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (ticketDetails: TicketAttributes) => {
    return new Ticket(ticketDetails);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
