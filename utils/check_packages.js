const sudo = require('sudo-prompt');
const child_process = require("child_process")
const dialog = require('dialog');

const packages = ["playerctl"]

function checkPackages() {
    return new Promise((resolve) => {
        let missingPackages = []

        for (const package of packages) {
            
            try {
                child_process.execSync(`${package} --help`)
            } catch {
                missingPackages.push(package)
                console.log(`${package} is currently missing`)
            }
        }
    
        if (missingPackages.length > 0) {
            console.log("Missing Packages Found")
            dialog.info(`${missingPackages.join(", ")} is currently missing, Do you want to install it now?`, 'Linux Currently Playing', function(exitCode) {
                if (exitCode == 0) {
                    let cmdString = ''

                    for (const p of missingPackages) {
                        cmdString += `apt install ${p}\n`
                    }

                    sudo.exec(cmdString, {name: "Linux Currently Playing"},
                      function(error, stdout, stderr) {
                        if (error) throw error;
                        resolve()
                      }
                    );

                };
            })
        } else {
            resolve("")
        }
    })
}

module.exports = {
    checkPackages
}