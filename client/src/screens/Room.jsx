import React, { useEffect, useCallback, useState } from "react";
import { useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [screenStream, setScreenStream] = useState();
  const audioRef = useRef(null); // Reference to the audio element
  const [currentTime, setCurrentTime] = useState(0); // Track current time
  const [duration, setDuration] = useState(0); // Track audio duration
  const [musicUrl,setMusicUrl] = useState(0);
  const [selectedSong, setSelectedSong] = useState(""); // Track selected song

  const songList = [
    { name: "Song 1", url: "path_to_your_songs/song1.mp3" },
    { name: "Song 2", url: "path_to_your_songs/song2.mp3" },
    { name: "Song 3", url: "path_to_your_songs/song3.mp3" },
  ];

    // Handle song change from dropdown
    const handleSongSelect = (e) => {
      const selectedSong = songList.find((song) => song.name === e.target.value);
      setSelectedSong(selectedSong.name);
      setMusicUrl(selectedSong.url);
    };


   // Play the audio
   const playAudio = () => {
    const id = 1;
    socket.emit("play:audio",{id});
    audioRef.current.play();
  };

  // Pause the audio
  const pauseAudio = () => {
    const id = 1;
    socket.emit("pause:audio",{id});
    audioRef.current.pause();
  };

   // Seek forward
   const seekForward = () => {
    const id = 1;
    console.log("done");
    socket.emit("seek:forward",{id});
    audioRef.current.currentTime += 10;
  };

  // Seek backward
  const seekBackward = () => {
    const id = 1;
    console.log("done");
    socket.emit("seek:backward",{id});
    audioRef.current.currentTime -= 10;
    if (audioRef.current.currentTime < 0) {
      audioRef.current.currentTime = 0; // Prevent negative time
    }
  };

  // Update current time as the audio plays
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  // Set duration when audio metadata is loaded
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };



  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handlePlayer = useCallback(async()=>{
    const id = 1;
    socket.emit("play:song",{id});
    console.log(id);
  },[]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handlePlay = useCallback(({id})=>{
    audioRef.current.play();
  },[]);
  const handlePause = useCallback(({id})=>{
    audioRef.current.pause();
  },[]);
  const handleForwardSeek = useCallback(({id})=>{
    console.log("done");
    audioRef.current.currentTime += 10;
  },[])
  const handleBackwardSeek = useCallback(({id})=>{
    console.log("done");

    audioRef.current.currentTime -= 10;
    if (audioRef.current.currentTime < 0) {
      audioRef.current.currentTime = 0; // Prevent negative time
    }
  },[])

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    // socket.on("play:song1", handlePlay);
    socket.on("play:audio1",handlePlay);
    socket.on("pause:audio1",handlePause);
    socket.on("seek:forward1",handleForwardSeek);
    socket.on("seek:backward1",handleBackwardSeek);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      // socket.off("play:song1", handlePlay);
      socket.off("play:audio1",handlePlay);
      socket.off("pause:audio1",handlePause);
      socket.off("seek:forward1",handleForwardSeek);
      socket.off("seek:backward1",handleBackwardSeek);

    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handlePlay,
    handlePause,
    handleForwardSeek,
    handleBackwardSeek
  ]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
        {myStream && (
          <>
            {/* <h1>My Stream</h1> */}
            <ReactPlayer
              playing
              muted
              height="100%"
              width="50%"
              url={myStream}
            />
          </>
        )}
        {remoteStream && (
          <>
            {/* <h1>Remote Stream</h1> */}
            <ReactPlayer
              playing
              muted
              height="100%"
              width="50%"
              url={remoteStream}
            />
          </>
        )}
        {
          remoteStream && 
          <>
            <button onClick={handlePlayer}>
                PlaySong
            </button>
          </>
        }
      </div>


      <div>
        <label>Select Song: </label>
        <select onChange={handleSongSelect} value={selectedSong}>
          <option value="">Select a song</option>
          {songList.map((song) => (
            <option key={song.name} value={song.name}>
              {song.name}
            </option>
          ))}
        </select>
      </div>

      <div>
      <audio
        ref={audioRef}
        src={musicUrl}
        type="audio/mp3"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      ></audio>

      <div>
        <button onClick={playAudio}>Play</button>
        <button onClick={pauseAudio}>Pause</button>
        <button onClick={() => seekForward(10)}>Seek Forward 10s</button>
        <button onClick={() => seekBackward(10)}>Seek Backward 10s</button>
      </div>

      <div>
        <p>
          Current Time: {formatTime(currentTime)} / Duration: {formatTime(duration)}
        </p>
      </div>
    </div>
    </div>
    
  );
};

export default RoomPage;
