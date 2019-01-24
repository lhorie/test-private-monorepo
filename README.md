# Test private monorepo

This is a test for embedding a public (OSS) monorepo into a private monorepo via a git submodule.

Despite using git submodules, you should (in theory) not have to run any submodule-specific commands. Simply run `yarn git ...` instead of `git ...`.

### Things you can try

##### Clone this repo:

```sh
git clone git@github.com:lhorie/test-private-monorepo.git
cd test-private-monorepo
```

##### Explore proof of concept branches

```sh
yarn git branch # yes, yarn git, not just git
yarn git checkout rush
```
