'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let helmet = require('helmet');
let AuthHelper = require('../helpers/auth');
let loader = require('../helpers/loader');
let active_strategies = loader('/auth/strategies').map((module) => {
  return module.File.strategy;
});

/**
 * Returns an express router to handle auth endpoints.
 * Receives an instance of the main express app.
*/
module.exports = (app) => {
  let router = express.Router();

  router.use(helmet());
  router.use(bodyParser.json());

  router.get('/', showActiveStrategies);

  router.post('/:strategy', isActiveStrategy);

  /** Mount the strategy-specific router */
  active_strategies.forEach((strategy) => {
    // Load a CORS configuration for this strategy
    router.use('/' + strategy.endpoint, AuthHelper.cors);
    // Use the strategy-provided router
    router.use('/' + strategy.endpoint, strategy.router());
    // Make sure the user is active
    router.use('/' + strategy.endpoint, AuthHelper.isActiveUser);
    // Issue a token
    router.use('/' + strategy.endpoint, AuthHelper.issueAccessToken);
  });

  return router;
};

/**
 * Show active strategies
 */
function showActiveStrategies (req, res) {
  let strategies = active_strategies.map((strategy) => {
    return {
      name: strategy.name,
      callback: '/auth/' + strategy.endpoint,
      data: strategy.data,
      auth_url: strategy.url
    };
  });

  res.status(200).json(strategies);
}

/**
 * Make sure strategy is defined and active
 */
function isActiveStrategy (req, res, next) {
  let active = false;

  active_strategies.forEach((strategy) => {
    if (req.params.strategy.toString() === strategy.endpoint) {
      active = true;
    }
  });

  if (active === true) {
    next();
  } else {
    res.sendStatus(405).end();
  }
}
