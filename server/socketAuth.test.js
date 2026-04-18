const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { parseCookies, canAccessNegotiation, createSocketAuthMiddleware } = require('./utils/socketAuth');

test('parseCookies extracts cookie values from the handshake header', () => {
  const cookies = parseCookies('token=abc123; theme=light%20mode');

  assert.deepEqual(cookies, {
    token: 'abc123',
    theme: 'light mode'
  });
});

test('canAccessNegotiation allows farmer, business, and admin users only', () => {
  const negotiation = {
    farmerId: 'farmer-1',
    businessId: 'business-1'
  };

  assert.equal(canAccessNegotiation({ _id: 'farmer-1', role: 'farmer' }, negotiation), true);
  assert.equal(canAccessNegotiation({ _id: 'business-1', role: 'business' }, negotiation), true);
  assert.equal(canAccessNegotiation({ _id: 'admin-1', role: 'admin' }, negotiation), true);
  assert.equal(canAccessNegotiation({ _id: 'outsider-1', role: 'customer' }, negotiation), false);
});

test('createSocketAuthMiddleware rejects sockets without a token cookie', async () => {
  const middleware = createSocketAuthMiddleware({
    jwtLib: {
      verify() {
        throw new Error('verify should not run without a token');
      }
    },
    userModel: {
      findById() {
        throw new Error('findById should not run without a token');
      }
    }
  });

  const socket = {
    handshake: {
      headers: {
        cookie: ''
      }
    }
  };

  const error = await new Promise((resolve) => {
    middleware(socket, (value) => resolve(value));
  });

  assert.equal(error.message, 'Not authorized');
  assert.equal(socket.user, undefined);
});

test('createSocketAuthMiddleware attaches the authenticated user to the socket', async () => {
  const middleware = createSocketAuthMiddleware({
    jwtLib: {
      verify(token, secret) {
        assert.equal(token, 'valid-token');
        assert.equal(secret, process.env.JWT_SECRET);
        return { userId: 'user-1' };
      }
    },
    userModel: {
      findById(id) {
        assert.equal(id, 'user-1');
        return {
          select: async () => ({ _id: 'user-1', name: 'Ravi', role: 'business', businessName: 'FreshMart' })
        };
      }
    }
  });

  const socket = {
    handshake: {
      headers: {
        cookie: 'token=valid-token; theme=dark'
      }
    }
  };

  const result = await new Promise((resolve) => {
    middleware(socket, (value) => resolve(value));
  });

  assert.equal(result, undefined);
  assert.deepEqual(socket.user, {
    _id: 'user-1',
    name: 'Ravi',
    role: 'business',
    businessName: 'FreshMart'
  });
});
