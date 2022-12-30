const child_process = require("child_process")

const datas = ['title', 'artist', 'mpris:length', 'xesam:url']

function runMetaFormat(format) {
    let meta;
    try {
        meta = child_process.execSync(`playerctl metadata --format "{{ ${format} }}"`, {stdio : 'pipe'}).toString().trim()
    } catch {
        meta = null
    }

    return meta
}

function getStatus() {
    let meta;
    try {
        meta = child_process.execSync(`playerctl status`, {stdio : 'pipe'}).toString().trim()
    } catch {
        meta = null
    }

    return meta
}

function runCtl() {
    const result = {}

    for (const d of datas) {
        let meta;
        try {
            meta = child_process.execSync(`playerctl metadata ${d}`, {stdio : 'pipe'}).toString().trim()
        } catch {
            meta = null
        }

        result[d] = meta
    }

    return result
}

module.exports = {
    runCtl,
    runMetaFormat,
    getStatus
}