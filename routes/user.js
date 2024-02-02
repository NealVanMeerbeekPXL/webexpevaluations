const express = require('express');

const router = express.Router();
const securityController = require('../controllers/securityController');
const { authenticate, authorize } = require('../middleware/authentication');

router.post('/login', securityController.login);

router.post('/logout', securityController.logout);

router.post(
  '/login/check',
  authenticate,
  authorize({ role: 'admin' }, { role: 'user' }),
  securityController.checkLogin,
);

module.exports = router;
