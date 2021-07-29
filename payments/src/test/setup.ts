import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

let mongo: MongoMemoryServer;

beforeAll(async () => {
    process.env.JWT_KEY = 'testingKey';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

beforeEach(async () => {
    jest.clearAllMocks();

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

// a global function for auth
global.signin = (id?: string) => {
    // Generate a new User ID
    const newRandomlyGeneratedId = new mongoose.Types.ObjectId().toHexString();

    // Build a JWT payload:  { id, email}
    const payload = {
        id: id || newRandomlyGeneratedId,
        email: 'test@test.com',
    };
    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object:  { jwt: MY-JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    //Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return a string that is the cookie with the encoded data:  { cookie: express:sess=... }
    return [`express:sess=${base64}`];
};
