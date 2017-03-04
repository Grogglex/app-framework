/*

  Purpose:
  - Define paths
  - Fix configuration file
  - Define forced state (to run end user scripts in development mode)
  - Define installation status
  - Load package information
  - Load app configuration
  - Define operating system
  - Function to compare path with .gitignore entries
  Provide everything as an object

*/

'use strict'

// Include Modules
let alert = require('./lib/alert')
let found = require('./lib/found')
let jsonScheme = require('./lib/json-scheme')
let fs = require('fs-extra')
let argParser = require('minimist')
let rel = require('path').join
let abs = require('path').resolve
let sep = require('path').sep

// Read script parameters
let arg = argParser(process.argv.slice(2))

// Define force status
let forced = arg.force === true || arg.f === true

// Define installation status
let installed = found('../../package.json')

// Define paths
let proj = installed ? abs(__dirname, '../../') : abs(__dirname)
let app = abs(proj, 'app')
let cache = abs(proj, 'node_modules/.app-framework-cache')

// Check configuration file
let configFix = jsonScheme.fix(abs(__dirname, 'config-scheme.json'), abs(app, 'config.json'))
if (Array.isArray(configFix)) {
  alert('Error: Failed to fix config file.\nDetails:\n- ' + configFix.join('\n- '), 'issue')
}

// Load configuration
let pkg = fs.readJsonSync(abs(proj, 'package.json'))
let cfg = fs.readJsonSync(abs(app, 'config.json'))

// Define operating system
let os = null
if (process.platform === 'win32') {
  os = 'win'
} else if (process.platform === 'darwin') {
  os = 'mac'
} else {
  alert('Error: Your operation system "' + process.platform + '" is not supported.', 'issue')
}

// Read .gitignore file as array with regexp
let ignoredExp = []
if (found(proj, '.gitignore')) {
  let gitignore = fs.readFileSync(abs(proj, '.gitignore'), 'utf8')
  let rows = gitignore.split("\n")
  for (let r = 0; r < rows.length; r++) {
    if (rows[r] !== '' && /^#/.test(rows[r]) === false) {
      let exp = rel(rows[r])
      // Escape points
      exp = exp.replace(/\./g, '\\.')
      // Escape slashs
      exp = exp.replace(/\//g, '\\/')
      // Escape wildcards
      exp = exp.replace(/\*/g, '(.*)')
      // Make last slash optional (to include folder itself)
      exp = exp.replace(/^(.+)\\\/$/, '$1(' + sep.replace('/', '\/') + '(.*))?')
      exp = RegExp('^' + exp + '$')
      ignoredExp.push(exp)
    }
  }
}

// Function to check path according .gitignore file
let ignored = function (path) {
  // Transform path, if folder, add separator to end
  let isIgnored = false
  for (let i = 0; i < ignoredExp.length; i++) {
    if (ignoredExp[i].test(path) === true) {
      isIgnored = true
      i = ignoredExp.length
    }
  }
  return isIgnored
}

module.exports = {
  arg: arg,
  forced: forced,
  installed: installed,
  proj: proj,
  app: app,
  cache: cache,
  pkg: pkg,
  cfg: cfg,
  os: os,
  ignored: ignored
}