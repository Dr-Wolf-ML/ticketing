import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { OrderStatus } from '@dr-wolf-at-npm/common-for-tix';

export { OrderStatus };

interface EventIdentifier {
    id: string;
    version: number;
}

// props to create an Order
interface OrderAttributes {
    id: string;
    userId: string;
    status: OrderStatus;
    version: number;
    price: number
}

// props that end up on an Order ( -> may be different to OrderAttributes)
interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    version: number;
    price: number
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(orderDetails: OrderAttributes): OrderDoc;
    findOrderNextInSequence(event: EventIdentifier): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
        },
        price: {
            type: Number,
            required: true,
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.findOrderNextInSequence = (event: EventIdentifier) => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1,
    });
};

orderSchema.statics.build = (orderDetails: OrderAttributes) => {
    return new Order({
        _id: orderDetails.id,
        userId: orderDetails.userId,
        status: orderDetails.status,
        version: orderDetails.version,
        price: orderDetails.price
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
