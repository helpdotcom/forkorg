'use strict';
module.exports = function(what) {
  var _ = require('underscore');
  require('underscore.haz')(_);

  var GitHubAPI = require('github');
  var github = new GitHubAPI({
    version: '3.0.0'
  });

  what = what || process.argv[2];
  var forkingRepo;

  if (!!what) {
    github.authenticate({
      type: "oauth",
      token: process.env.FORKORG_GITHUB_TOKEN
    });

    forkingRepo = what.split('/');

    switch (forkingRepo.length) {
      case 1:
        forkOrg(forkingRepo[0]);
        break;
      case 2:
        forkRepo(forkingRepo[0], forkingRepo[1]);
        break;
      default:
        errorMessage();
    }
  } else {
    errorMessage();
  }

  function errorMessage() {
    throw new Error('a github "organization/repo" or "organization" must be provided as an argument');
  }

  function forkRepo(organization, repo) {
    github.repos.fork({
      user: organization,
      repo: repo
    }, function(error, repo) {
      if (error) {
        console.log(error);
        return false;
      }
      console.log('forked to: ' + repo.full_name);
    });
  }

  // fork all repos for an org
  function forkOrg(organization) {
    github.repos.getFromOrg({
      org: organization,
      type: 'all',
      per_page: 100
    }, function(error, repos) {
      if (error) {
        throw error;
      }
      var name = '';
      for (name in repos) {
        if (_.haz(repos[name], 'owner.login') && _.haz(repos[name], 'name')) {
          forkRepo(repos[name].owner.login, repos[name].name);
        }
      }
    });
  }
};