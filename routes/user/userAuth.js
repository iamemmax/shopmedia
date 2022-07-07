

const  router  = require('express').Router();
const {
	passportLoginSuccess,
	passportLoginFailure,
    facebookLoginSuccess,
    facebbokLoginFailure
} = require('../../controllers/users/userAuth');
const passport = require('passport');


// @desc login user using the google strategy
// @route GET /api/auth/google
// @access PUBLIC
router.route('/google').get(
	passport.authenticate('google', {
		scope: ['https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
        'https://www.googleapis.com/auth/user.addresses.read',
        'https://www.googleapis.com/auth/profile.agerange.read'],
        
	})
);

// @desc redirect route for the passport google strategy
// @route GET /api/auth/google/redirect
// @access PUBLIC
router.route('/google/callback').get(
	passport.authenticate('google', {
		successRedirect: '/api/auth/google/redirect/success',
		failureRedirect: '/api/auth/google/redirect/failure',
		failureFlash: true,
	})
);

// @desc redirect route for the passport google strategy
// @route GET /api/auth/google/redirect
// @access PUBLIC
router.route('/google/redirect/success').get(passportLoginSuccess);

// @desc redirect route for the passport google strategy
// @route GET /api/auth/google/redirect
// @access PUBLIC
router.route('/google/redirect/failure').get(passportLoginFailure);








// @desc login user using the google strategy
// @route GET /api/auth/FACEBOOK
// @access PUBLIC
router.route('/facebook').get(
    passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages'] }));

// @desc redirect route for the passport google strategy
// @route GET /api/auth/google/redirect
// @access PUBLIC
router.route('/google/callback').get(
	passport.authenticate('facebook', {
		successRedirect: '/api/auth/facebook/redirect/success',
		failureRedirect: '/api/auth/facebook/redirect/failure',
		failureFlash: true,
	})
);

// @desc redirect route for the passport google strategy
// @route GET /api/auth/google/redirect
// @access PUBLIC
router.route('/facebook/redirect/success').get(passportLoginSuccess);

// @desc redirect route for the passport google strategy
// @route GET /api/auth/google/redirect
// @access PUBLIC
router.route('/facebook/redirect/failure').get(passportLoginFailure);




module.exports = router;