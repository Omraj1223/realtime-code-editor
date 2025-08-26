import { useEffect, useState } from 'react';
import './App.css';
import io from 'socket.io-client'
import Editor from '@monaco-editor/react'

const socket=io("https://realtime-code-editor-7wz2.onrender.com")

const App = () => {
  const [joined,setJoined]=useState(false);
  const [roomId,setRoomId]=useState("");
  const[userName,setUserName]=useState("");
  const[language,setLanguage]=useState("javascript");
  const[code,setCode]=useState("");
  const[copySuccess,setCopySuccess]=useState("")
  const[users,setUsers]=useState([]);
  const[typing,setTyping]=useState("");


  // useEffect(()=>{
    

    // return ()=>{
    //   socket.off("codeUpdate");
    // }
  // })

  useEffect(()=>{
    socket.on("userJoined",(users)=>{
      setUsers(users)
    });

    socket.on("codeUpdate",(newCode)=>{
        setCode(newCode);
    })

    socket.on("usertyping",(user)=>{
        setTyping(`${user.slice(0,8)}...is typing`)
        setTimeout(() => {
          setTyping ("")
        }, 2000);
    })

    socket.on("languageUpdate",(newLanguage)=>{
      setLanguage(newLanguage);
    })

    return ()=>{
      socket.off("userJoined")
      socket.off("soceUpdate")
      socket.off("usertyping")
      socket.off("languageUpdate")
    }
  },[]);

  useEffect(()=>{
    const handlleBeforeUnload=()=>{
      socket.emit("leaveRoom");
    }

    window.addEventListener("beforeunload",handlleBeforeUnload)

    return()=>{
      window.removeEventListener("beforeunload",handlleBeforeUnload);

    };
  },[]);

  const joinRoom=()=>{
    if(roomId && userName){
      socket.emit("join",{roomId,userName});
      setJoined(true);
    }
  }

  const leaveRoom=()=>{
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("");
    setLanguage("javascript");

  }

  const copyRoomId=()=>{
    navigator.clipboard.writeText(roomId)
    setCopySuccess("Copied")
    setTimeout(()=>setCopySuccess(""),2000)
    
  };

  const handleCodeChange=(newCode)=>{
    setCode(newCode);
    socket.emit("codeChange",{roomId,code:newCode})
    socket.emit("typing",{roomId,userName})
  };

  const handleLanguageChange = (e)=>{
    const newLanguage=e.target.value;
    setLanguage(newLanguage)
    socket.emit("languageChange",{roomId,language:newLanguage});

  };

  if(!joined){
    return (
    <div className='join-container'>
      <div className="join-form">
        <h1>Join code room</h1>
        <input 
          type="text" 
          placeholder='Room Id' 
          value={roomId} 
          onChange={e=>setRoomId(e.target.value)}
        />

        <input 
          type="text" 
          placeholder='Your Name' 
          value={userName} 
          onChange={e=>setUserName(e.target.value)}
        />

        <button onClick={joinRoom}>JoinRoom</button>

      </div>
    </div>
  )
  }
  return <div className='editor-container'>
    <div className='sidebar'>
      <div className='room-info'>
        <h2>Room code:{roomId}</h2>
        <button onClick={copyRoomId} className='copy-button'>Copy Id</button>
        {copySuccess && <span className='copy-success'>{copySuccess}</span>}
      </div>
      <h3>Users in room:</h3>
      <ul>
        <ul>
        {users.slice(0, 8).map((user, index) => (
        <li key={index}>{user}</li>
         ))}
        {users.length > 8 && <li>...</li>}
</ul>


      </ul>
      <p className='typing-indicator'>{typing}</p>
      <select className='language-selector' value={language} onChange={handleLanguageChange}>
        <option value="javascript">Javascript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">cpp</option>
      </select>
      <button className='leave-button' onClick={leaveRoom}>Leave room</button>
    </div>

    <div className="editor-wrapper">
      <Editor 
      height={"100%"} 
      // defaultLanguage={language} 
      language={language} 
      value={code} 
      onChange={handleCodeChange} 
      theme='vs-dark' 
      options={
        {minimap:{enabled:false},
        fontSize:14,}}
      />
    </div>
  </div>
  
}

export default App
