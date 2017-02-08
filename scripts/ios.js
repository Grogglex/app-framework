// Load packages
var path = require('path')
var isThere = require('is-there')
var copy = require('cpx').copy
var run = require('./run')
var showOnly = require('./show-only')
var read = require('read-file')
var deleteFiles = require('delete')
var xml = require('xml2js')
var write = require('write')

// Load configuration
var cfg = require('./config.js')
var app = require(cfg.appRoot + 'package.json')

// Show message
showOnly('iOS build ongoing - please wait ...')

// Install cordova plugins
// let currentPlugins = require(cfg.packageRoot + 'cordova/plugins/fetch.json')
function installCordovaPlugins (callback) {
  callback()
  /*
  pluginNo = pluginNo || 0
  for (let p = pluginNo; p < app.useCordovaPlugins; p++) {
    if (currentPlugins) {
      console.log('isInstalled')
    }
  }
  */
}

// Create cordova project folder
function createCordovaProject (callback) {
  if (!isThere(cfg.packageRoot + 'cordova/config.xml')) {
    run('cd "' + cfg.packageRoot + '" && cordova create cordova', function () {
      updateCordovaBuild(callback)
    })
  } else {
    updateCordovaBuild(callback)
  }
}

// Update cordova www folder,  config.xml and plugins
function updateCordovaBuild (callback) {
  // Install cordova plugins
  installCordovaPlugins(function () {
    // Get version of last build to be used
    var htaccess = read.sync(path.resolve(cfg.appRoot, 'www/.htaccess'), 'utf8')
    var version = htaccess.match(/build-(.+)\//)[1]
    // Build folder exists
    if (isThere(path.resolve(cfg.appRoot, 'www/build-' + version))) {
      // Delete cordova www folder
      deleteFiles(path.resolve(cfg.packageRoot, 'cordova/www/**/*'), function (err) {
        if (err) {
          throw new Error(err)
        } else {
          // Copy build files
          copy(path.resolve(cfg.appRoot, 'www/build-' + version + '/**/*'), path.resolve(cfg.packageRoot, 'cordova/www'), function (err) {
            if (err) {
              throw new Error(err)
            } else {
              // Read cordova config file
              read(path.resolve(cfg.packageRoot, 'cordova/config.xml'), 'utf-8', function (err, content) {
                if (err) {
                  throw new Error(err)
                } else {
                  // Parse cordova config file
                  let xmlParser = new xml.Parser()
                  xmlParser.parseString(content, function (err, cordovaConfig) {
                    if (err) {
                      throw new Error(err)
                    } else {
                      // Update application name
                      cordovaConfig.widget.name = app.title
                      // Build cordova config file
                      let builder = new xml.Builder()
                      let cordovaConfigXml = builder.buildObject(cordovaConfig)
                      // Save cordova config file
                      write(path.resolve(cfg.packageRoot, 'cordova/config.xml'), cordovaConfigXml, function (err) {
                        if (err) {
                          throw new Error(err)
                        } else {
                          callback()
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    } else {
      throw new Error(version === '0.0.0' ? 'You must build your application first.' : 'Build folder "www/build-' + version + '" not found.')
    }
  })
}

// (Re)build cordova ios platform
function buildCordovaIos (callback) {
  createCordovaProject(function () {
    let removePlatform = isThere(path.resolve(cfg.packageRoot, 'cordova/platforms/ios')) ? 'cordova platform rm ios && ' : ''
    run('cd "' + path.resolve(cfg.packageRoot, 'cordova') + '" && ' + removePlatform + 'cordova platform add ios', function () {
      callback()
    })
  })
}

// Start build process
buildCordovaIos(function () {
  // run('cd "' + path.resolve(cfg.packageRoot, 'cordova') + '" && cordova run ios')
  run('open -a Xcode "' + path.resolve(cfg.packageRoot, 'cordova/platforms/ios', app.title + '.xcodeproj') + '"')
  showOnly('iOS build done! Please open Xcode to run the simulator or to publish your application to the App Store.')
})
