import request from 'supertest';
import { app } from '../../app';

it('returns {} on signout', async () => {
    // Arrange
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);

    await request(app)
        .post('/api/users/signout')
        // Act
        .send({})
        // Assert
        .expect({});
});

it('clears the cookie after signing out', async () => {
    // Arrange
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signout')
        // Act
        .send({})
        // Assert
        .expect(200);

    expect(response.get('Set-Cookie')[0]).toContain([
        'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
    ]);
});
