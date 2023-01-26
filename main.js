// Credential Variables
const APP_ID = "7fcd66f8061649e4b70c14a183de6d48"
const TOKEN = "007eJxTYHi08tFap536szoLq+/Ur8jZ8mnrl12uj1ec+v9H2c5H5uY1BQbztOQUM7M0CwMzQzMTy1STJHODZEOTREML45RUsxQTi3yvS8kNgYwMC/3UmBgZIBDEZ2HITczMY2AAAJ2+Iw0="
const CHANNEL = "main"

// Creating client object which provides basic function for voice and video calls. 
const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'}) // mode = live/rtc, codec - vp8 video compression format

let localTracks = [] // store current user's data in a list
let remoteUsers = {} // store all other user's data in object

let joinAndDisplayLocalStream = async () => {
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
    // alert("its working")
    await joinAndDisplayLocalStream()

    // to hide join btn and disply stream control btns once user is in the stream
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex' 
}

document.getElementById('join-btn').addEventListener('click', joinStream)