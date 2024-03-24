const {check} = require ('express-validator');

exports.signUpValidation = [
    check('username', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password', 'Password is required').isLength({min:6}),
    check('location', 'Please enter a location').not().isEmpty(),
    check('contact', 'Please enter a contact').not().isEmpty(),

]

exports.loginValidation = [
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password', 'Password is required').isLength({min:6}),
 ]

 exports.forgetValidation = [
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    
 ]

 exports.updateProfileValidation = [
    check('username', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid mail').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('location', 'Please enter a location').not().isEmpty(),
    check('contact', 'Please enter a contact').not().isEmpty(),
]

