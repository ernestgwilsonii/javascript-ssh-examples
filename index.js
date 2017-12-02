const { sshClient } = require('./lib/sshClient.js');
const localDebug = false;
////////////////////////////////////////////////////////////////////////////////
// MAIN //
//////////

// hosts array can be a single host or many
hosts = ["172.28.0.12", "172.28.0.13", "172.28.0.14"];
port = 22;
username = 'root';
password = 'blahblah!';
command = 'hostname && uptime';

// Create the array of SSH session objects needed to feed Promise all
let sshPromiseArr = [];
for (let host of hosts) {
    sshPromiseArr.push(new sshClient(host, port, username, password, command).execute());
}

// async await style!
async function sshTaskRunner(arr) {
    try {
        const respones = await Promise.all(arr);
        for (let res of respones) {
            if (res.err) {
                console.log(res.sshHost);
                console.log(res.err);
            }
            console.log(res.data);
        }
    } catch (err) {
        console.error(err);
    }
}

sshTaskRunner(sshPromiseArr);
////////////////////////////////////////////////////////////////////////////////
