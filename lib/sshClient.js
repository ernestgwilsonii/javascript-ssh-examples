const { ssh2Command } = require('./ssh2Command.js');
const localDebug = false;
////////////////////////////////////////////////////////////////////////////////
class sshClient {
    constructor(sshHost, sshPort, sshUsername, sshPassword, sshCommand) {
        this.sshHost = sshHost;
        this.sshPort = sshPort;
        this.sshUsername = sshUsername;
        this.sshPassword = sshPassword;
        this.sshCommand = sshCommand;
    }

    execute() {
        return new Promise((resolve, reject) => {
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
