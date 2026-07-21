const { validationResult } = require('express-validator');

// Sits after any express-validator body()/param() checks on a route.
// If any check failed, respond with the first error message.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

module.exports = validate;