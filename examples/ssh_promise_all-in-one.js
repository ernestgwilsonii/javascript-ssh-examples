#!/usr/bin/env node
////////////////////////////////////////////////////////////////////////////////
// JavaScript SSH commands
//     - Promise style
////////////////////////////////////////////////////////////////////////////////
const ssh2 = require('ssh2').Client;
const localDebug = false;
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// Callback compatibility needed for ssh2 //
////////////////////////////////////////////
function ssh2Command(sshHost, sshPort, sshUsername, sshPassword, sshCommand, callback) {
    let resultsArr = [];
    let res = {};
    res.sshHost = sshHost;
    const conn = new ssh2();
    conn.on('ready', () => {
        conn.exec(sshCommand, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                if (localDebug) { console.log('Stream :: close :: code: ' + code + ', signal: ' + signal); };
                if (resultsArr.length == 0) {
                    let errMsg = ("No output was received from SSH command!");
                    res.err = errMsg;
                    callback(res);
                };
                let results = resultsArr.join("");
                if (localDebug) { console.log(results); };
                res.data = results;
                callback(null, res);
                conn.end();
            }).on('data', (res) => {
                if (localDebug) { console.log('STDOUT: ' + res); };
                resultsArr.push(res);
            }).stderr.on('data', (err) => {
                if (localDebug) { console.log('STDERR: ' + err); };
                let errMsg = 'stderr output was detected from SSH command: ' + err;
                res.err = errMsg;
                callback(res);
            });
        });
    }).connect({
        host: sshHost,
        port: sshPort,
        username: sshUsername,
        password: sshPassword
    });
}
module.exports.ssh2Command = ssh2Command;
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// Promise wrapper class //
///////////////////////////
class sshClient {
    constructor(sshHost, sshPort, sshUsername, sshPassword, sshCommand) {
        this.sshHost = sshHost;
        this.sshPort = sshPort;
        this.sshUsername = sshUsername;
        this.sshPassword = sshPassword;
        this.sshCommand = sshCommand;
    }

    execute() {
        // Wrap the entire thing in a Promise
        return new Promise((resolve, reject) => {
            // Invoke the old school ssh2 module via callback method
            ssh2Command(this.sshHost, this.sshPort, this.sshUsername, this.sshPassword, this.sshCommand, (err, res) => {
                if (err) {
                    // SSH connection errors
                    if (localDebug) { console.log(err.sshHost); }
                    if (localDebug) { console.log(err); }
                    resolve(err); // Currently not using reject, change as deired
                } else if (res.err) {
                    // SSH application command specific errors
                    if (localDebug) { console.log(res.sshHost); }
                    if (localDebug) { console.log(res.err); }
                    resolve(res);
                } else {
                    // SSH command results data
                    if (localDebug) { console.log(res.sshHost); }
                    if (localDebug) { console.log(res.data); }
                    resolve(res);
                }
            });
        });
    }
}
module.exports.sshClient = sshClient;
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// MAIN //
//////////

// One host
host = '172.28.0.12';
port = 22;
username = 'root';
password = 'blahblah!';
command = 'hostname && uptime';

// Promise style!
new sshClient(host, port, username, password, command).execute()
    .then((res) => {
        if (res.err) {
            console.log(res.sshHost);
            console.log(res.err);
        }
        console.log(res.data);
    }).catch(err => {
        console.log(err)
    });
////////////////////////////////////////////////////////////////////////////////
