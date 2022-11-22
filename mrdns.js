const hostToIp = require('host-to-ip');
const nodePortScanner = require('node-port-scanner');
const domainPing = require("domain-ping");
const isopen = require("isopen");
const TeleBot = require('telebot');
const dns = require('node-dns');
const prettier = require('prettier');
const ipfetch = require('ip-fetch');

//REPLACE your token here
const bot = new TeleBot({
  token: 'YOUR TOKEN HERE',
  usePlugins: ['askUser']
}); // On start command

bot.on('/start', msg => {
  const id = msg.from.id; // Ask user name

  return bot.sendMessage(id, 'Hello! Let me help you and type one of the following commands:\n/ip - check IP from a DNS;\n/port - check the most common open ports;\n/ping - check the server status;\n/who - WHOIS of IP address');
}); 

//------------------------------------ On ip command ----------------------------------------------//

bot.on('/ip', msg => {
  const id = msg.from.id; // Ask user name

return bot.sendMessage(id, `For what DNS you want to find the IP?`, {
    ask: 'ip'
  });
}); // Ask name event

bot.on('ask.ip', msg => {
  const id = msg.from.id;
  const fqdn = msg.text;
  const jafoste = fqdn;
  hostToIp(fqdn, {all: true, family: 4})
    .then(ip => {
      let son = JSON.stringify(ip)//.replaceAll(']','').replaceAll('[','').replaceAll('{"address":"','').replaceAll('","family":4}','')
      let msg = `I found the following reverse IP addresses for the DNS: ${fqdn}: ${son}`
      console.log(ip);
      bot.sendMessage(id, msg);
     })
    .catch(err => console.error(err))
})
  
//---------------------------- On /port command-----------------------------

bot.on('/port', msg => {
  const id = msg.from.id;

  return bot.sendMessage(id, 'For which DNS will we find the ports?', {
    ask: 'port'
  });
}); // Ask name event

bot.on('ask.port', msg => {
  const id = msg.from.id;
  const port = msg.text;

  nodePortScanner(`${port}`, [21, 22, 23, 25, 80, 110, 139, 143, 445, 1433, 1521, 2052, 2082, 2086, 2093, 2095, 2096, 8080, 8880, 7000, 8000, 25461, 443, 8443, 25500, 3306, 3389]).then(results => {
    console.log(results);
    bot.sendMessage(id, `I found the following ports for the DNS ${results.host}: \n \n` + results.ports.open);
  }).catch(error => {
    console.log(error);
  });
}); 



// On ping command -----------------------------------------------------------

bot.on('/ping', msg => {
  const id = msg.from.id;

  return bot.sendMessage(id, 'Which address will we ping?', {
    ask: 'ping'
  });
});

bot.on('ask.ping', msg => {
  const id = msg.from.id;
  const ping = msg.text;

  domainPing(`${ping}`)
  .then(res => {
    bot.sendMessage(id, `Check bellow the status of the server ${ping}: \n ${prettier.format(JSON.stringify(res), {
      semi: false,
      parser: "json"
    })}`);
    console.log(res);
  }).catch(error => {
    console.error(error);
  });
});


//On WHOIS command ------------------------------------------------------------


bot.on('/who', msg => {
  const id = msg.from.id;

  return bot.sendMessage(id, 'For which address will we check the WHOIS?', {
    ask: 'who'
  });
}); // Ask name event

bot.on('ask.who', msg => {
  const id = msg.from.id;
  const who = msg.text;
  let info;
  let result = JSON.stringify(info);

  let fun = async () => {
    info = await ipfetch.getLocationNpm(`${who}`); 
    bot.sendMessage(id, `Here is what I found about the IP ${who}\n \n ${prettier.format(JSON.stringify(info), {
      semi: false,
      parser: "json"
    })}`);
  };

  fun(); 
}); 

// On /ports command (run this to check every port between 0 and 65000, be careful it may take a couple hours...

bot.on('/ports', msg => {
  const id = msg.from.id;

  return bot.sendMessage(id, 'For which DNS will we find every ports?', {
    ask: 'ports'
  });
});

bot.on('ask.ports', msg => {
  const id = msg.from.id;
  const ports = msg.text;

   async function checkLocalPorts() {
    const allPorts = nodePortScanner(`${ports}`, []);
    console.log(await allPorts);
    bot.sendMessage(id, `I found the following ports between 0 and 650000 ${await allPorts}: \n \n`);
  }

  checkLocalPorts();
});

bot.start()
