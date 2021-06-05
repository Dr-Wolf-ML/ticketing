import request from 'supertest';
import { app } from '../../app';

it('fails when a non-existant email is supplied', async () => {
    // Arrange
    await request(app)
        .post('/api/users/signin')
        // Act
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        // Assert
        .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
    // Arrange
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        // Act
        .send({
            email: 'test@test.com',
            password: 'qwer1234',
        })
        // Assert
        .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
    // Arrange
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        // Act
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        // Assert
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});
