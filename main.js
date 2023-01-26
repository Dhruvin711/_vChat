// Credential Variables
const APP_ID = "7fcd66f8061649e4b70c14a183de6d48"
const TOKEN = "007eJxTYHi08tFap536szoLq+/Ur8jZ8mnrl12uj1ec+v9H2c5H5uY1BQbztOQUM7M0CwMzQzMTy1STJHODZEOTREML45RUsxQTi3yvS8kNgYwMC/3UmBgZIBDEZ2HITczMY2AAAJ2+Iw0="
const CHANNEL = "main"

// Creating client object which provides basic function for voice and video calls. 
const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'}) // mode = live/rtc, codec - vp8 video compression format

let localTracks = [] // store current user's data in a list
let remoteUsers = {} // store all other user's data in object

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    // UID = Unique Identifier
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null) // adds local users to our channel while returning UID

    // This method will help user to access their camera and audio and store this value in localTracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() // [audioTracks - 0 index, videoTracks - 1 index] array

    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="video-player" id="user-${UID}"></div>
                  </div>`
    
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    
    localTracks[1].play(`user-${UID}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}

let joinStream = async () => {
    await joinAndDisplayLocalStream()

    // to hide join btn and disply stream control btns once user is in the stream
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex' 
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if(mediaType === 'video'){
        // If user already has a video player then remove it so browser doesn't create duplicate
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player != null){
            player.remove()
        }
        
        player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div>
                  </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i=0; i<localTracks.length; i++){
        localTracks[i].stop() // to stop the video and audio from playing
        localTracks[i].close() // to close the track and release space that was occupied
    }

    await client.leave()

    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}

let toggleMic = async (e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = 'cadetblue'
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = 'blue'
    }
}

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = 'cadetblue'
    }
    else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = 'blue'
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)