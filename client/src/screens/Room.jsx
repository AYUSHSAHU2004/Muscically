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
  const audioRef = useRef(null); // Reference to the audio element
  const [currentTime, setCurrentTime] = useState(0); // Track current time
  const [duration, setDuration] = useState(0); // Track audio duration
  const [musicUrl, setMusicUrl] = useState("");
  const [selectedSong, setSelectedSong] = useState(""); // Track selected song
  const [firstUser, setFirstUser] = useState(1);  
  const [showSong,setShowSong] = useState("");
  const [songList, setSongList] = useState([
    { name: "song1", url: "path_to_your_songs/song1.mp3" ,showName :"ye jawani hai diwani"},
    { name: "song2", url: "path_to_your_songs/song2.mp3" ,showName :"Ae Dil Hai Muskil"},
    { name: "song3", url: "path_to_your_songs/song3.mp3",showName :"Bulleya"},
  ]);

  const handleSongSelect = (e) => {
    const selectedSong = songList.find((song) => song.name === e.target.value);
    const sN = selectedSong.name;
    const rN = selectedSong.showName;
    socket.emit("select:song", { sN,rN });
    console.log(sN);
    setSelectedSong(sN);
    setShowSong(rN);
    setMusicUrl(`${process.env.REACT_APP_BASE_PATH}${sN}.mp3`);
  };

  // Play the audio
  const playAudio = useCallback(async () => {
    const id = 1;
    socket.emit("play:audio", { id });
    console.log(audioRef);
    audioRef.current.play();
  }, [selectedSong]);

  // Pause the audio
  const pauseAudio = () => {
    const id = 1;
    socket.emit("pause:audio", { id });
    audioRef.current.pause();
  };

  // Seek forward
  const seekForward = () => {
    const id = 1;
    console.log("done");
    socket.emit("seek:forward", { id });
    audioRef.current.currentTime += 10;
  };

  // Seek backward
  const seekBackward = () => {
    const id = 1;
    console.log("done");
    socket.emit("seek:backward", { id });
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
    setFirstUser(1);
    const cfu = 0;
    socket.emit("user:call", { to: remoteSocketId, offer, cfu });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer, cfu }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      setFirstUser(cfu);
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

  const handlePlayer = useCallback(async () => {
    const id = 1;
    socket.emit("play:song", { id });
    console.log(id);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handlePlay = useCallback(({ id }) => {
    console.log(audioRef);
    audioRef.current.play();
  }, [musicUrl]);
  const handlePause = useCallback(({ id }) => {
    audioRef.current.pause();
  }, []);
  const handleForwardSeek = useCallback(({ id }) => {
    console.log("done");
    audioRef.current.currentTime += 10;
  }, []);
  const handleBackwardSeek = useCallback(({ id }) => {
    console.log("done");

    audioRef.current.currentTime -= 10;
    if (audioRef.current.currentTime < 0) {
      audioRef.current.currentTime = 0; // Prevent negative time
    }
  }, []);

  const handleSongSelect1 = useCallback((data) => {
    console.log(data.sN);
    setSelectedSong(data.sN);
    setShowSong(data.rN);
    setMusicUrl(`${process.env.REACT_APP_BASE_PATH}${data.sN}.mp3`);
  }, [socket]);
  const handleConfirmSong1 = useCallback(({ mu }) => {
    setMusicUrl(mu);
    console.log(musicUrl);
  }, [musicUrl]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("play:audio1", handlePlay);
    socket.on("pause:audio1", handlePause);
    socket.on("seek:forward1", handleForwardSeek);
    socket.on("seek:backward1", handleBackwardSeek);
    socket.on("select:song1", handleSongSelect1);
    socket.on("confirm:music1", handleConfirmSong1);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("play:audio1", handlePlay);
      socket.off("pause:audio1", handlePause);
      socket.off("seek:forward1", handleForwardSeek);
      socket.off("seek:backward1", handleBackwardSeek);
      socket.off("select:song1", handleSongSelect1);
      socket.off("confirm:music1", handleConfirmSong1);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handleConfirmSong1,
    handlePlay,
    handlePause,
    handleForwardSeek,
    handleBackwardSeek,
    handleSongSelect1,
  ]);

  return (
    <div style={{ backgroundColor: "#f8d7e5", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#d6336c" }}>Your Concert</h1>
      <h4 style={{ textAlign: "center", color: "#6f42c1" }}>
        {remoteSocketId ? "Connected" : "No one in room"}
      </h4>
      {myStream && firstUser === 0 && (
        <button
          onClick={sendStreams}
          style={{ padding: "10px", margin: "10px", backgroundColor: "#e83e8c", color: "#fff", border: "none", borderRadius: "5px" }}
        >
          Accept Call
        </button>
      )}
      {remoteSocketId && firstUser === 1 && (
        <button
          onClick={handleCallUser}
          style={{ padding: "10px", margin: "10px", backgroundColor: "#e83e8c", color: "#fff", border: "none", borderRadius: "5px" }}
        >
          CALL
        </button>
      )}
      <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
        {myStream && (
          <ReactPlayer
            playing
            muted
            height="100%"
            width="50%"
            url={myStream}
            style={{ borderRadius: "10px", margin: "10px" }}
          />
        )}
        {remoteStream && (
          <ReactPlayer
            playing
            muted
            height="100%"
            width="50%"
            url={remoteStream}
            style={{ borderRadius: "10px", margin: "10px" }}
          />
        )}
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <label>Select Song: </label>
        <select onChange={handleSongSelect} value={selectedSong} style={{ padding: "5px", borderRadius: "5px", margin: "10px" }}>
          <option value="">Select a song</option>
          {songList.map((song, index) => (
            <option key={index} value={song.name}>
              {song.showName}
            </option>
          ))}
        </select>
        {selectedSong && (
          <div style={{ marginTop: "10px", color: "#20c997" }}>
            <span>Now Playing: {showSong}</span>
          </div>
        )}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={playAudio}
            style={{
              padding: "10px",
              margin: "10px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Play
          </button>
          <button
            onClick={pauseAudio}
            style={{
              padding: "10px",
              margin: "10px",
              backgroundColor: "#ffc107",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Pause
          </button>
          <button
            onClick={seekForward}
            style={{
              padding: "10px",
              margin: "10px",
              backgroundColor: "#17a2b8",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Seek Forward
          </button>
          <button
            onClick={seekBackward}
            style={{
              padding: "10px",
              margin: "10px",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Seek Backward
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            src={musicUrl}
            style={{ display: "none" }}
          />
          <div>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
