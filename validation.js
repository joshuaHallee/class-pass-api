//Validation, because we're good at it
const Joi = require("@hapi/joi");

//Register validation
const registerValidation = data => {
  const schema = {
    name: {
      first: Joi.string()
        .min(6)
        .required(),
      last: Joi.string()
        .min(6)
        .required()
    },
    role: {
      isTeacher: Joi.boolean().required(),
      isStudent: Joi.boolean().required(),
      isParent: Joi.boolean().required()
    },
    email: Joi.string()
      .min(6)
      .required()
      .email(),
    phone: Joi.string()
      .min(6)
      .required(),
    password: Joi.string()
      .min(6)
      .required()
  };
  return Joi.validate(data, schema);
};

const loginValidation = data => {
  const schema = {
    email: Joi.string()
      .min(6)
      .required()
      .email(),
    password: Joi.string()
      .min(6)
      .required()
  };
  return Joi.validate(data, schema);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
