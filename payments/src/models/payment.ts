import mongoose from 'mongoose';

// props to create an Order
interface PaymentAttributes {
    orderId: string;
    stripeId: string;
}

// props that end up on an Order ( -> may be different to OrderAttributes)
interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(paymentDetails: PaymentAttributes): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
        },
        stripeId: {
            type: String,
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
    }
);

paymentSchema.statics.build = (paymentDetails: PaymentAttributes) => {
    return new Payment(paymentDetails);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
    'Payment',
    paymentSchema
);

export { Payment };
