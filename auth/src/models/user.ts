import mongoose from 'mongoose';

// Attributes required to create a new user
interface UserAttributes {
    email: string;
    password: string;
};

// describes the props of a User model with added .build function
interface UserModel extends mongoose.Model<UserDoc> {
    build (userDetails: UserAttributes): UserDoc;
};

// describes the props of a User document (a record in MongoDB)
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
};

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.statics.build = (userDetails: UserAttributes) => {
    return new User(userDetails);
};

const User = mongoose.model<UserDoc, UserModel> ('User', userSchema);

export { User };
