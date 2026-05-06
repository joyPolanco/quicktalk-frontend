

import sendSound from "../assets/sounds/send.mp3"


function useSendSound () {
    const play=()=>{
     sendSound.currentTime=0;
     sendSound.play().catch((error)=>console.log("Audio play failed"))
    }

    return {play}
}
export default useSendSound