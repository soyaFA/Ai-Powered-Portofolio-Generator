import { Router } from 'express';
import {
  getDatabaseMode,
  portfolioRepository,
  toPublicUser,
  userRepository,
} from '../db.ts';
import {
  createAuthToken,
  hashPassword,
  requireAuth,
  verifyPassword,
  type AuthenticatedRequest,
} from '../services/authService.ts';
import { analyzeGitHubUser } from '../services/githubService.ts';
import { isAIConfigured, optimizePortfolioWithAI } from '../services/aiService.ts';
import {
  generateResetOtp,
  hashResetOtp,
  isResetRequestThrottled,
  isResetOtpExpired,
  isResetOtpMatching,
  isValidResetPassword,
  MIN_RESET_PASSWORD_LENGTH,
  RESET_OTP_TTL_MINUTES,
  OTP_MAX_ATTEMPTS,
} from '../services/passwordResetService.ts';
import {
  isEmailConfigured,
  sendPasswordResetOtpEmail,
} from '../services/emailService.ts';
import type { CareerTrack, PortfolioDocument } from '../../src/types/portfolio.ts';

export const apiRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: getDatabaseMode(),
    aiConfigured: isAIConfigured(),
    timestamp: new Date().toISOString(),
  });
});

apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, githubUsername } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      githubUsername?: string;
    };

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';
    const cleanGithub =
      typeof githubUsername === 'string'
        ? githubUsername.trim().replace(/^@/, '')
        : '';

    if (cleanName.length < 2) {
      res.status(400).json({ error: 'Name must be at least 2 characters.' });
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (rawPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const existing = await userRepository.findByEmail(cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const created = await userRepository.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash: hashPassword(rawPassword),
      githubUsername: cleanGithub || undefined,
    });

    const user = toPublicUser(created);
    const token = createAuthToken({ id: user.id, email: user.email, name: user.name });
    res.status(201).json({ token, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed.';
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';

    if (!EMAIL_REGEX.test(cleanEmail) || !rawPassword) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const record = await userRepository.findByEmail(cleanEmail);
    if (!record || !verifyPassword(rawPassword, record.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user = toPublicUser(record);
    const token = createAuthToken({ id: user.id, email: user.email, name: user.name });
    res.json({ token, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign in failed.';
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!EMAIL_REGEX.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (isResetRequestThrottled(cleanEmail)) {
      res.json({
        message:
          'If an account with this email exists, a verification code has been sent.',
      });
      return;
    }

    const user = await userRepository.findByEmail(cleanEmail);
    if (user) {
      const { code, codeHash, expiresAt } = generateResetOtp();
      await userRepository.setPasswordResetOtp(cleanEmail, codeHash, expiresAt);
      await sendPasswordResetOtpEmail(
        user.email,
        user.name,
        code,
        RESET_OTP_TTL_MINUTES
      );
    }

    res.json({
      message:
        'If an account with this email exists, a verification code has been sent.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Password reset request failed.';
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/auth/reset-password', async (req, res) => {
  try {
    const { code, password } = req.body as { code?: string; password?: string };
    const providedCode = typeof code === 'string' ? code.trim() : '';

    if (!/^\d{6}$/.test(providedCode)) {
      res.status(400).json({
        error: 'Please enter the 6-digit verification code.',
      });
      return;
    }
    if (!isValidResetPassword(typeof password === 'string' ? password : '')) {
      res.status(400).json({
        error: `Password must be at least ${MIN_RESET_PASSWORD_LENGTH} characters.`,
      });
      return;
    }

    const user = await userRepository.findByResetOtpHash(hashResetOtp(providedCode));
    if (
      !user ||
      !isResetOtpMatching(user.resetOtpHash, providedCode)
    ) {
      if (user) {
        const incremented = await userRepository.incrementResetOtpAttempts(user.id);
        if (incremented && (incremented.resetOtpAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
          await userRepository.updatePasswordAndClearResetOtp(user.id, user.passwordHash);
          res.status(400).json({
            error: 'Too many incorrect attempts. Please request a new verification code.',
          });
          return;
        }
      }
      res.status(400).json({
        error: 'Incorrect verification code. Please try again or request a new one.',
      });
      return;
    }
    if (isResetOtpExpired(user.resetOtpExpires)) {
      res.status(400).json({
        error: 'This verification code has expired. Please request a new one.',
      });
      return;
    }

    const newPasswordHash = hashPassword(password as string);
    const updated = await userRepository.updatePasswordAndClearResetOtp(
      user.id,
      newPasswordHash
    );
    if (!updated) {
      res.status(404).json({ error: 'Account no longer exists.' });
      return;
    }

    res.json({
      message: 'Password has been reset successfully. You can now sign in with your new password.',
      otpTtlMinutes: RESET_OTP_TTL_MINUTES,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Password reset failed.';
    res.status(500).json({ error: message });
  }
});

apiRouter.get('/auth/reset-email-configured', (_req, res) => {
  res.json({ emailConfigured: isEmailConfigured() });
});

apiRouter.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const record = await userRepository.findById(authUser.id);
    if (!record) {
      res.status(401).json({ error: 'Account no longer exists.' });
      return;
    }
    res.json({ user: toPublicUser(record) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load account.';
    res.status(500).json({ error: message });
  }
});

apiRouter.get('/github/analyze/:username', requireAuth, async (req, res) => {
  try {
    const analysis = await analyzeGitHubUser(req.params.username);
    res.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to analyze GitHub profile.';
    const status = message.includes('not found') ? 404 : message.includes('rate limit') ? 429 : 400;
    res.status(status).json({ error: message });
  }
});

apiRouter.post('/ai/optimize', requireAuth, async (req, res) => {
  try {
    const {
      profile,
      topRepos,
      languages,
      activity,
      careerTrack,
      profileReadmeExcerpt,
      variationIndex,
    } = req.body as {
      profile?: PortfolioDocument['profile'];
      topRepos?: PortfolioDocument['topRepos'];
      languages?: PortfolioDocument['languages'];
      activity?: PortfolioDocument['activity'];
      careerTrack?: CareerTrack;
      profileReadmeExcerpt?: string;
      variationIndex?: number;
    };

    if (!profile || !Array.isArray(topRepos)) {
      res.status(400).json({ error: 'Missing analyzed GitHub profile or repositories payload.' });
      return;
    }

    const optimized = await optimizePortfolioWithAI({
      profile,
      topRepos,
      languages: languages ?? [],
      activity: activity ?? {
        recentEventsCount: 0,
        pushEventsCount: 0,
        prEventsCount: 0,
        activeDaysLast30: 0,
        totalStars: 0,
        totalForks: 0,
        primaryLanguage: 'General',
        topLanguages: [],
        inferredFocus: 'Software Engineering',
        accountYears: 1,
      },
      careerTrack: careerTrack || activity?.inferredFocus || 'Software Engineering',
      profileReadmeExcerpt,
      variationIndex: typeof variationIndex === 'number' ? variationIndex : 0,
    });

    res.json(optimized);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI optimization failed.';
    const status = message.includes('traffic spike') ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

apiRouter.get('/portfolios', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const list = await portfolioRepository.findAllByUser(req.authUser!.id);
    res.json(list);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list portfolios.';
    res.status(500).json({ error: message });
  }
});

apiRouter.get('/portfolios/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await portfolioRepository.findByIdForUser(req.params.id, req.authUser!.id);
    if (result.status === 'not_found') {
      res.status(404).json({ error: 'Portfolio not found.' });
      return;
    }
    if (result.status === 'forbidden') {
      res.status(403).json({ error: 'You do not have access to this portfolio.' });
      return;
    }
    res.json(result.doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load portfolio.';
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/portfolios', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body as Omit<PortfolioDocument, 'id' | 'createdAt' | 'updatedAt'>;
    if (!payload?.username || !payload?.profile || !payload?.templateId) {
      res.status(400).json({ error: 'Missing required portfolio fields.' });
      return;
    }
    const created = await portfolioRepository.create({
      ...payload,
      userId: req.authUser!.id,
    });
    res.status(201).json(created);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save portfolio.';
    res.status(500).json({ error: message });
  }
});

apiRouter.put('/portfolios/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const updates = { ...req.body } as Partial<PortfolioDocument>;
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.updatedAt;

    const result = await portfolioRepository.updateForUser(
      req.params.id,
      req.authUser!.id,
      updates
    );
    if (result.status === 'not_found') {
      res.status(404).json({ error: 'Portfolio not found.' });
      return;
    }
    if (result.status === 'forbidden') {
      res.status(403).json({ error: 'You do not have permission to edit this portfolio.' });
      return;
    }
    res.json(result.doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update portfolio.';
    res.status(500).json({ error: message });
  }
});

apiRouter.delete('/portfolios/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const status = await portfolioRepository.removeForUser(req.params.id, req.authUser!.id);
    if (status === 'not_found') {
      res.status(404).json({ error: 'Portfolio not found.' });
      return;
    }
    if (status === 'forbidden') {
      res.status(403).json({ error: 'You do not have permission to delete this portfolio.' });
      return;
    }
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete portfolio.';
    res.status(500).json({ error: message });
  }
});
