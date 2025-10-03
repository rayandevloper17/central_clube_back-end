import express from 'express';
import VerificationEmailService from '../services/emailVerification.service.js';
import VerificationEmailController from '../controllers/emailVerification.controller.js';
import nodemailer from 'nodemailer';

export default function createVerificationEmailRoutes(models) {
  const router = express.Router();

  // Email transport setup
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rayandevloper@gmail.com',
      pass: 'spmr ghsi apoc slqb',
    },
  });

  const service = VerificationEmailService(models, transporter);
  const controller = VerificationEmailController(service);

  router.post('/send', controller.sendVerification);
  router.post('/verify', controller.verifyToken);

  return router;
}
