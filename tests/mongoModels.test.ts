import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserModel } from '../server/models/User.ts';
import { PortfolioModel } from '../server/models/Portfolio.ts';

describe('MongoDB Mongoose Models', () => {
  it('validates UserModel schema fields, email normalization, and unique index', async () => {
    const invalidUser = new UserModel({ name: 'Khaled' });
    await assert.rejects(() => invalidUser.validate(), /email|passwordHash/);

    const validUser = new UserModel({
      name: '  Khaled Ahmed  ',
      email: '  KHALED@Example.com ',
      passwordHash: 'salt:hash',
      githubUsername: '  khaleddev  ',
    });
    await validUser.validate();

    assert.equal(validUser.name, 'Khaled Ahmed');
    assert.equal(validUser.email, 'khaled@example.com');
    assert.equal(validUser.githubUsername, 'khaleddev');

    const indexes = UserModel.schema.indexes();
    const emailIdx = indexes.find(([fields]) => fields.email === 1);
    assert.ok(emailIdx, 'Expected email index on UserSchema');
    assert.equal(emailIdx[1].unique, true, 'Expected email index to be unique');
  });

  it('validates PortfolioModel schema fields, userId ownership index, and template enum', async () => {
    const missingOwner = new PortfolioModel({
      username: 'gaearon',
      profile: { login: 'gaearon' },
      activity: { primaryLanguage: 'JavaScript' },
      aiContent: { headline: 'Engineer' },
    });
    await assert.rejects(() => missingOwner.validate(), /userId/);

    const invalidTemplate = new PortfolioModel({
      userId: 'user-123',
      username: 'gaearon',
      templateId: 'unknown-template',
      profile: { login: 'gaearon' },
      activity: { primaryLanguage: 'JavaScript' },
      aiContent: { headline: 'Engineer' },
    });
    await assert.rejects(() => invalidTemplate.validate(), /templateId/);

    const validPortfolio = new PortfolioModel({
      userId: 'user-123',
      username: 'gaearon',
      templateId: 'editorial',
      profile: { login: 'gaearon', name: 'Dan' },
      activity: { primaryLanguage: 'JavaScript' },
      aiContent: { headline: 'React Engineer' },
    });
    await validPortfolio.validate();
    assert.equal(validPortfolio.accentColor, '#2563EB');
    assert.equal(validPortfolio.availableForHire, true);

    const indexes = PortfolioModel.schema.indexes();
    const userIdIdx = indexes.find(([fields]) => fields.userId === 1);
    assert.ok(userIdIdx, 'Expected userId index on PortfolioSchema');
  });
});
