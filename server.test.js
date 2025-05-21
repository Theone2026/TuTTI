import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import { Message } from '../models/Message.js';
import { authenticate } from '../middleware/authenticate.js';

jest.mock('../middleware/authenticate.js');

describe('GET /api/messages', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

});
