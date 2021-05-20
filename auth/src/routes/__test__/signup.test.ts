import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  // Arrange
  const NewUser = {
    email: 'test@test.com',
    password: 'password',
  };
  await request(app)
    // Act
    .post('/api/users/signup')
    .send(NewUser)
    // Assert
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  // Arrange
  const NewUser = {
    email: 'testtest.com',
    password: 'password',
  };

  await request(app)
    // Act
    .post('/api/users/signup')
    .send(NewUser)
    // Assert
    .expect(400);
});

it('returns a 400 with an invalid password - less than 4 characters', async () => {
  // Arrange
  const NewUser = {
    email: 'test@test.com',
    password: 'p',
  };

  await request(app)
    // Act
    .post('/api/users/signup')
    .send(NewUser)
    // Assert
    .expect(400);
});

it('returns a 400 with an invalid password - more than than 20 characters', async () => {
  // Arrange
  const NewUser = {
    email: 'test@test.com',
    password: 'passwordpasswordpassword',
  };

  await request(app)
    // Act
    .post('/api/users/signup')
    .send(NewUser)
    // Assert
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  // Arrange
  const NewUser = {};

  await request(app)
    // Act
    .post('/api/users/signup')
    .send(NewUser)
    // Assert
    .expect(400);
});

it('disallows duplicate emails', async () => {
  // Arrange
  const NewUser = {
    email: 'test@test.com',
    password: 'password',
  };

  await request(app)
    // Act
    .post('/api/users/signup')
    .send(NewUser)
    // Assert
    .expect(201);

  await request(app)
    // Act
    .post('/api/users/signup')
    .send(NewUser)
    // Assert
    .expect(400);
});

it('sets a cookie after successful sign-up', async () => {
  // Arrange
  const NewUser = {
    email: 'test@test.com',
    password: 'password',
  };

  // Act
  const response = await request(app)
    .post('/api/users/signup')
    .send(NewUser)

    // Assert
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
