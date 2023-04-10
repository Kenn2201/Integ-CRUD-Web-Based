const { Router } = require('express');
const router = Router();
const authControllers = require('../controllers/authControllers');


router.route('/login')
  .get(authControllers.login_get)
  .post(authControllers.login_post);

  router.route('/signup')
  .get(authControllers.signup_get)
  .post(authControllers.signup_post);

  router.route('/logout').get(authControllers.logout_get);




module.exports = router;