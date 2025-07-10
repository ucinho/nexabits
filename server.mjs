import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Firestore } from '@google-cloud/firestore';
import crypto from 'crypto';
import { Telegraf } from 'telegraf';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const secretClient = new SecretManagerServiceClient();
const PROJECT_ID = "858950055775";
const ALGORITHM = "aes-256-cbc";
const TRANSFER_AMOUNT = 1200000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const firestore = new Firestore();
const collectionName = process.env.FIRESTORE_COLLECTION || 'TapUsers';
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const validPasscode = process.env.passcode;

const bot = new Telegraf(TELEGRAM_TOKEN);

// ✅ Basic root route for browser tests
app.get('/', (req, res) => {
  res.send('Nexabit Backend is running 🚀');
});

// ✅ Serve frontend (React or HTML) if built
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, 'build');

app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// ✅ Launch server
const server = app.listen(process.env.PORT || 8080, () => {
  console.log(`Server running on port ${server.address().port}`);
  bot.launch();
  console.log('Bot launched');
  //keepAlive(); // Make sure keepAlive is defined
});

// ✅ Telegram verification logic
const verifyTelegramWebAppData = (telegramInitData) => {
  const encoded = decodeURIComponent(telegramInitData);
  const secret = crypto.createHmac("sha256", "WebAppData").update(TELEGRAM_TOKEN);
  const arr = encoded.split("&");
  const hashIndex = arr.findIndex((str) => str.startsWith("hash="));
  const hash = arr.splice(hashIndex)[0].split("=")[1];
  arr.sort((a, b) => a.localeCompare(b));
  const dataCheckString = arr.join("\n");
  const _hash = crypto.createHmac("sha256", secret.digest()).update(dataCheckString).digest("hex");
  return _hash === hash;
};

// ✅ User utilities
const generateReferralLink = (userId) => `https://t.me/NexaBit_Tap_bot/start?startapp=${userId}`;
const removeUndefinedValues = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null));

const saveOrUpdateUser = async (user) => {
  user.id = user.id?.toString() || '';
  if (!user.id.trim()) return;
  try {
    const sanitizedUser = removeUndefinedValues(user);
    sanitizedUser.timestamp ||= Firestore.FieldValue.serverTimestamp();
    await firestore.collection(collectionName).doc(user.id).set(sanitizedUser, { merge: true });
  } catch (error) {
    console.error('Error saving or updating user:', error);
  }
};

const getUserById = async (userId) => {
  userId = userId?.toString() || '';
  if (!userId.trim()) return null;
  try {
    const userDoc = await firestore.collection(collectionName).doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      userData.referralLink = generateReferralLink(userId);
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

const incrementUserCount = async (userId, increment) => {
  try {
    const user = await getUserById(userId);
    if (user) {
      user.count = (user.count || 0) + increment;
      await saveOrUpdateUser(user);
    }
  } catch (error) {
    console.error('Error incrementing user count:', error);
  }
};

const saveReferral = async (referral) => {
  referral.referrerId = referral.referrerId?.toString() || '';
  referral.userId = referral.userId?.toString() || '';
  if (!referral.referrerId.trim() || !referral.userId.trim()) return;
  try {
    const referredUser = await getUserById(referral.userId);
    const incrementAmount = referredUser.isPremium ? 10000 : 5000;

    await firestore.collection('Referrals').doc(referral.referrerId).set({
      referredUsers: Firestore.FieldValue.arrayUnion(referral.userId),
      timestamp: Firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await incrementUserCount(referral.referrerId, incrementAmount);
    await incrementUserCount(referral.userId, incrementAmount);
  } catch (error) {
    console.error('Error saving referral:', error);
  }
};

const processUserAndReferral = async (userId, referrerId, userInfo) => {
  let user = await getUserById(userId);
  if (!user) {
    user = {
      id: userId,
      ...userInfo,
      count: 0,
      referralLink: generateReferralLink(userId)
    };
    await saveOrUpdateUser(user);
  }

  user = await getUserById(userId);

  if (referrerId && referrerId !== userId) {
    const referrer = await getUserById(referrerId);
    if (referrer) {
      const reverseRef = await firestore.collection('Referrals')
        .where('referrerId', '==', userId)
        .where('referredUsers', 'array-contains', referrerId)
        .get();

      if (!reverseRef.empty) return;

      const existingRef = await firestore.collection('Referrals')
        .where('referredUsers', 'array-contains', userId)
        .get();

      if (existingRef.empty) {
        await saveReferral({ referrerId, userId });
      }
    }
  }
};

// ✅ Telegram command handler
const handleStartCommand = async (ctx) => {
  const userId = ctx.from.id.toString();
  const referrerId = ctx.startPayload?.toString() || null;
  const userInfo = {
    username: ctx.from.username,
    isBot: ctx.from.is_bot,
    isPremium: ctx.from.is_premium || false,
    firstName: ctx.from.first_name,
    timestamp: Firestore.FieldValue.serverTimestamp(),
  };

  await ctx.replyWithHTML(
    `Hey ${userInfo.firstName}, welcome to Nexabit 🎉!\nNexabit is an L3 AI protocol powered by Arkham Intelligence and OpenAI.\n\nIt aggregates trading data from whales, big banks and corporations; and then uses this data and AI to identify potential buy and sell levels, thereby helping users to trade more profitably.\n\nOur mini app is live! Farm $NEXAI tokens now. By farming, you train our AI to be more intelligent in spotting great trade opportunities and Airdrops.\n\nWith 60% of the supply going to our community, future rewards are immense.\nInvite your friends and amplify the excitement! Click on Open App to start now`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Open App', url: 'https://t.me/NexaBit_Tap_bot/start' }],
          [{ text: '🌐 Join community', url: 'https://t.me/nexabitHQ' }]
        ]
      }
    }
  );

  await processUserAndReferral(userId, referrerId, userInfo);
};

bot.start(handleStartCommand);
