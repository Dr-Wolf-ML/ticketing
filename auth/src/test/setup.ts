import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';

declare global {
    namespace NodeJS {
        interface Global {
            getCookie(): Promise<string[]>;
        }
    }
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
    process.env.JWT_KEY = 'testingKey';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

beforeEach(async () => {
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
global.getCookie = async () => {
    const NewUser = {
        email: 'test@test.com',
        password: 'password',
    };
    const getCookieResponse = await request(app)
        .post('/api/users/signup')
        .send(NewUser)
        .expect(201);

    const cookie = getCookieResponse.get('Set-Cookie');

    return cookie;
};
