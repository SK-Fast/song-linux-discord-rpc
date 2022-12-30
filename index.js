const { checkPackages } = require("./utils/check_packages")
const { runCtl, runMetaFormat, getStatus } = require("./utils/song_metadata")
const config = require("./config")
const notifier = require("node-notifier")
const rpcClient = require('./discord-rich-presence')(config.clientID);

const main = async() => {
    console.log("Checking Packages...")

    await checkPackages()

    console.log("Packages OK!")

    notifier.notify({
        title: 'Linux Currently Playing',
        message: 'Linux Currently Playing is running in the background.',
    });

    let oldSongTitle = ""
    let oldSongStatus = ""
    let oldSongPosition = 0

    setInterval(() => {
        const ctl = runCtl()
        const timeLeft = runMetaFormat('mpris:length - position') || 0
        const songPosition = runMetaFormat('position') || 0
        const songStatus = getStatus()

        let jumpDetected = false

        // Detect Position Jump
        if (Math.abs(songPosition - oldSongPosition) > 2) {
            jumpDetected = true
        }

        oldSongPosition = songPosition        

        if (ctl.title == oldSongTitle && oldSongStatus == songStatus && jumpDetected == false) {
            return
        }

        oldSongTitle = ctl.title
        oldSongStatus = songStatus

        const startTime = new Date()

        const endTime = new Date()
        endTime.setMilliseconds(endTime.getMilliseconds() + (timeLeft / 1000))
        
        let startTimestamp = startTime.getTime()
        let endTimeStamp = endTime.getTime()
        let smallImg = undefined

        if (songStatus == "Paused") {
            startTimestamp = undefined
            endTimeStamp = undefined
            smallImg = 'paused'
        } else if (songStatus == "Stopped") {
            smallImg = undefined
            startTimestamp = undefined
            endTimeStamp = undefined
        } else if (songStatus == "Playing") {
            smallImg = 'playing'
        } else if (songStatus == null) {
            ctl['artist'] = "Not currently playing anything"
            ctl['title'] = "Not currently playing"
            startTimestamp = undefined
            endTimeStamp = undefined
        }

        rpcClient.updatePresence({
            state: ctl.artist || "Unknown Artist",
            details: (ctl.title || "Not currently playing"),
            startTimestamp: startTimestamp,
            endTimestamp: endTimeStamp,
            largeImageKey: 'song',
            smallImageKey: smallImg,
            instance: true,
        });
    }, 100);
}

main()

process.on('unhandledRejection', (t) => {
    notifier.notify({
        title: 'LCP Crashed',
        message: t,
    });
    
    throw t
})