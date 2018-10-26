#!/usr/bin/env node

const IPFS = require('ipfs')
const ipfsAPI = require('ipfs-api')
const Pubsub = require('orbit-db-pubsub')

const IPFS_OPTIONS = {
  EXPERIMENTAL: {
    pubsub: true
  }
}
const DISCOVER_ROOM = '3box-discover'

// Create IPFS instance
const ipfs = new IPFS(IPFS_OPTIONS)
ipfs.on('error', (e) => console.error(e))
ipfs.on('ready', async () => {
  const pubsub = new Pubsub(ipfs, (await ipfs.id()).id)
  let knownAddrs = {}
  let peerNum = 0
  pubsub.subscribe(DISCOVER_ROOM, (topic, userAddr) => {
    if (!knownAddrs[userAddr]) {
      knownAddrs[userAddr] = true
      peerNum++
      console.log(peerNum, 'unique users have been connected')
    }
  }, () => {})
})

//const ipfs = new ipfsAPI({ host: 'ipfs.3box.io', port: '5001', protocol: 'http' })
//const a = async () => {
  //console.log('asdf')
  //console.log(await ipfs.id())
  //console.log('asdf')
  //const pubsub = new Pubsub(ipfs, (await ipfs.id()).id)
  //pubsub.subscribe(DISCOVER_ROOM, console.log, console.log)
//}

//a()

const express = require('express')
const serveStatic = require('serve-static')
const path = require('path')
const port = 40001

const app = express()
app.use(serveStatic(path.join(__dirname), {'index': ['index.html']}))
app.listen(port, () => {
  console.log(`Open http://localhost:${port} in a browser to start using the example`)
})
