```js
  cli
    .command(`dev [targetDir]`, 'start development server')
    .option('-p, --port <port>', 'use specified port (default: 8080)')
    .option('-t, --temp <temp>', 'set the directory of the temporary file')
    .option('-c, --cache [cache]', 'set the directory of cache')
    .option('--host <host>', 'use specified host (default: 0.0.0.0)')
    .option('--no-cache', 'clean the cache before build')
    .option('--no-clear-screen', 'do not clear screen when dev server is ready')
    .option('--debug', 'start development server in debug mode')
    .option('--silent', 'start development server in silent mode')
    .option('--open', 'open browser when ready')
    .action((sourceDir = '.', commandOptions) => {
      const { debug, silent } = commandOptions

      logger.setOptions({ logLevel: silent ? 1 : debug ? 4 : 3 })
      logger.debug('global_options', options)
      logger.debug('dev_options', commandOptions)
      env.setOptions({ isDebug: debug, isTest: process.env.NODE_ENV === 'test' })

      wrapCommand(dev)({
        sourceDir: path.resolve(sourceDir),
        ...options,
        ...commandOptions
      })
    })
```
