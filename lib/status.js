'use strict';

var Common = require('./common');

function StatusController(node) {
  this.node = node;
  this.common = new Common({log: this.node.log});
}

StatusController.prototype.show = function(req, res) {
  var self = this;
  var option = req.query.q;

  switch(option) {
  case 'getDifficulty':
    this.getDifficulty(function(err, result) {
      if (err) {
        return self.common.handleErrors(err, res);
      }
      res.jsonp(result);
    });
    break;
  case 'getLastBlockHash':
    res.jsonp(this.getLastBlockHash());
    break;
  case 'getBestBlockHash':
    this.getBestBlockHash(function(err, result) {
      if (err) {
        return self.common.handleErrors(err, res);
      }
      res.jsonp(result);
    });
    break;
  case 'getMiningInfo':
      return self.getMiningInfo(function(err, result) {

          if (err) {
              return self.common.handleErrors(err, res);
          }

          res.jsonp(result);
      });
  case 'getStakingInfo':
      return self.getStakingInfo(function(err, result) {

          if (err) {
              return self.common.handleErrors(err, res);
          }

          return res.jsonp(result);
      });
  case 'getInfo':
  default:
    this.getInfo(function(err, result) {
      if (err) {
        return self.common.handleErrors(err, res);
      }
      res.jsonp({
        info: result
      });
    });
  }
};

StatusController.prototype.getInfo = function(callback) {
  this.node.services.VIPSTARCOINd.getInfo(function(err, result) {
    if (err) {
      return callback(err);
    }
    var info = {
      version: result.version,
      protocolversion: result.protocolVersion,
      walletversion: result.walletversion,
      balance: result.balance,
      blocks: result.blocks,
      timeoffset: result.timeOffset,
      connections: result.connections,
      proxy: result.proxy,
      difficulty: result.difficulty,
      testnet: result.testnet,
      keypoololdest: result.keypoololdest,
      keypoolsize: result.keypoolsize,
      paytxfee: result.paytxfee,
      relayfee: result.relayFee,
      errors: result.errors,
      network: result.network,
      reward: result.reward
    };
    callback(null, info);
  });
};

StatusController.prototype.getMiningInfo = function(callback) {
    return this.node.services.VIPSTARCOINd.getMiningInfo(function(err, result) {

      if (err) {
          return callback(err);
      }

      return callback(null, {
          netstakeweight: result.netstakeweight
      });

    });
};
StatusController.prototype.getStakingInfo = function(callback) {
    return this.node.services.VIPSTARCOINd.getStakingInfo(function(err, result) {

      if (err) {
          return callback(err);
      }

      return callback(null, {
          weight: result.weight,
          netstakeweight: result.netstakeweight
      });

    });
};

StatusController.prototype.getDgpInfo = function(req, res) {

  var self = this;

  return this.node.services.VIPSTARCOINd.getDgpInfo(function(err, result) {

      if (err) {
          return self.common.handleErrors(err, res);
      }

      res.jsonp(result);

  });

};

StatusController.prototype.getLastBlockHash = function() {
  var hash = this.node.services.VIPSTARCOINd.tiphash;
  return {
    syncTipHash: hash,
    lastblockhash: hash
  };
};

StatusController.prototype.getBestBlockHash = function(callback) {
  this.node.services.VIPSTARCOINd.getBestBlockHash(function(err, hash) {
    if (err) {
      return callback(err);
    }
    callback(null, {
      bestblockhash: hash
    });
  });
};

StatusController.prototype.getDifficulty = function(callback) {
  this.node.services.VIPSTARCOINd.getInfo(function(err, info) {
    if (err) {
      return callback(err);
    }
    callback(null, {
      difficulty: info.difficulty
    });
  });
};

StatusController.prototype.sync = function(req, res) {
  var self = this;
  var status = 'syncing';

  this.node.services.VIPSTARCOINd.isSynced(function(err, synced) {
    if (err) {
      return self.common.handleErrors(err, res);
    }
    if (synced) {
      status = 'finished';
    }

    self.node.services.VIPSTARCOINd.syncPercentage(function(err, percentage) {
      if (err) {
        return self.common.handleErrors(err, res);
      }
      var info = {
        status: status,
        blockChainHeight: self.node.services.VIPSTARCOINd.height,
        syncPercentage: Math.round(percentage),
        height: self.node.services.VIPSTARCOINd.height,
        error: null,
        type: 'VIPSTARCOINcore node'
      };

      res.jsonp(info);

    });

  });

};

// Hard coded to make insight ui happy, but not applicable
StatusController.prototype.peer = function(req, res) {
  res.jsonp({
    connected: true,
    host: '127.0.0.1',
    port: null
  });
};

StatusController.prototype.version = function(req, res) {
  var pjson = require('../package.json');
  res.jsonp({
    version: pjson.version
  });
};

module.exports = StatusController;
