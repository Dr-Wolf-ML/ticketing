import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
    // Arrange
    const cookie = await global.getCookie();

    // Act
    const currentUserResponse = await request(app)
        .get('/api/users/currentuser')
        .set({ cookie }) // or .set('Cookie', cookie)
        .send({})
        // Assert
        .expect(200);

    expect(currentUserResponse.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
    // Arrange
    // Act
    const currentUserResponse = await request(app)
        .get('/api/users/currentuser')
        .send({})
        // Assert
        .expect(200);

    expect(currentUserResponse.body.currentUser).toEqual(null);
});
