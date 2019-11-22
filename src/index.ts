import commander from 'commander'

commander
  .version('Codeowners 0.1.0', '-v, --version')
  .option('-d, --debug', 'enable debug mode')
  .arguments('<file> <line>')
  .description('...')
  .action((file, line, options) => {
    console.log('HW')
  })

commander.parse(process.argv)
