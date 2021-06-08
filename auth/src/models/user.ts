import mongoose from 'mongoose';

import { Password } from '../services/password';

// Attributes required to create a new User
interface UserAttributes {
    email: string;
    password: string;
}

// describes the props of a User document (a record in MongoDB)
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

// describes the props of a User model with added .build function
interface UserModel extends mongoose.Model<UserDoc> {
    build(userDetails: UserAttributes): UserDoc;
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;
            },
        },
    },
);

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashedPassword = await Password.toHash(this.get('password'));
        this.set('password', hashedPassword);
    }

    done();
});

userSchema.statics.build = (userDetails: UserAttributes) => {
    return new User(userDetails);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
