const DISCOVER_ROOM = '3box-discover'
bopen.addEventListener('click', event => {
  const ethAddr = web3.eth.accounts[0]
  Box.openBox(ethAddr, web3.currentProvider).then(box => {
    window.box = box
    box.onSyncDone(() => updateProfileData(box))
    controlls.style.display = 'block'
    loginb.style.display = 'none'
    updateProfileData(box)

    box._ipfs.swarm.connect('/dnsaddr/discover.3box.io/tcp/443/wss/ipfs/QmVpzUgkCvMhTXqUSisV3bA8HdkLftVFwBd8RzJx39ezx3', console.log)

    let knownAddrs = {}
    let peerNum = 0
    box._pubsub.subscribe(DISCOVER_ROOM, (topic, userAddr) => {
      if (!knownAddrs[userAddr]) {
        peers.innerHTML += '<div id="peer' + peerNum + '">' +
          '<span style="font-size: 32px">' + userAddr +
          ' loading... </span></div>\n'
        knownAddrs[userAddr] = true
        getProfileForPeer(userAddr, peerNum)
        peerNum++
      }
    }, console.log)

    setInterval(() => {
      box._pubsub.publish(DISCOVER_ROOM, ethAddr)
    }, 1000)
  })
})

function updateProfileData (box) {
  console.log('rendering profile')
  box.public.all().then(profile => {
    profileData.innerHTML = renderUser(profile)
  })
  updateContactList()
}

async function updateContactList () {
  contacts.innerHTML = ''
  console.log('ucl')
  let contact = null
  let i = -1
  do {
    contact = await window.box.private.get('contacts[' + ++i + ']')
    console.log(contact)
    if (contact && contact !== 'removed') getProfileForContact(contact, i)
  } while (contact)
}

function getProfileForContact (addr, divNum) {
  contacts.innerHTML += '<div id="contact' + divNum + '">' +
    '<span style="font-size: 32px">' + addr +
    ' loading... </span></div>\n'
  console.log('getting contact', addr)
  Box.getProfile(addr).then(profile => {
    console.log(addr, profile)
    const usrDiv = renderUser(profile, 'remove', divNum)
    console.log('contact', usrDiv)
    document.getElementById('contact' + divNum).innerHTML = usrDiv
    document.getElementById('remove' + divNum).addEventListener('click', event => {
      console.log('removing contact', addr)
      removeContact(addr)
    })
  })
}

function getProfileForPeer (addr, divNum) {
  console.log('getting peer', addr)
  Box.getProfile(addr).then(profile => {
    console.log(addr, profile)
    const usrDiv = renderUser(profile, 'add', divNum)
    document.getElementById('peer' + divNum).innerHTML = usrDiv
    document.getElementById('add' + divNum).addEventListener('click', event => {
      console.log('adding contact', addr)
      addContact(addr)
    })
  })
}

function renderUser (profile, btnTxt, divNum) {
  const imgHash = profile.image[0].contentUrl['/']
  const img = '<img class="img-circle" src="https://ipfs.infura.io/ipfs/' + imgHash + '" />    '
  const btn = '<button id="' + btnTxt + divNum + '" type="button" class="btn btn-primary btn-lg">' + btnTxt + '</button>'
  return '<div class="asdf">' + img + '<span style="font-size: 32px">' + profile.name + '</span>    ' + (btnTxt ? btn : '') + '</div>'
}

async function addContact (addr) {
  let contact = null
  let i = -1
  do {
    contact = await window.box.private.get('contacts[' + ++i + ']')
    console.log(contact, i)
    if (contact === addr) return
  } while (contact !== 'removed' && contact)
  await window.box.private.set('contacts[' + i + ']', addr)
  console.log('contacts[' + i + ']', addr)
  updateContactList()
}

async function removeContact (addr) {
  let contact = null
  let i = -1
  do {
    contact = await window.box.private.get('contacts[' + ++i + ']')
    if (contact === addr) {
      await window.box.private.set('contacts[' + i + ']', 'removed')
      console.log('contacts[' + i + ']', 'removed')
    }
  } while (contact)
  updateContactList()
}
