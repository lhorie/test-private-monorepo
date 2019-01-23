# Test private monorepo

This is a test for embedding a public (OSS) monorepo into a private monorepo via a git submodule and linking projects together via Rush.

### Things you can try

##### Clone this repo:

```sh
git clone git@github.com:lhorie/test-private-monorepo.git
yarn git checkout rush # yes, yarn git, not just git
```

##### Bootstrap

```sh
rush update
rush build
```

##### Rebuild after changes

```
rush update
rush rebuild
```

Note: `rush build` will sometimes skip packages. Use `rebuild` instead.

##### Clean up local copy

```
rush purge
```

##### Run synchronized git commands via:

The [public repo](https://github.com/lhorie/test-public-monorepo) is a submodule of the private repo. By default, submodules don't stay in sync with the parent repo. In order to keep both in sync, use `yarn git` instead of just `git`.

```sh
yarn git [...]

# e.g.
yarn git add .
yarn git commit -m "hello world"
yarn git push origin rush
```

This runs the same commands in the private repo and the [public repo](https://github.com/lhorie/test-public-monorepo) and ensures the submodule points to the correct commit at all times.