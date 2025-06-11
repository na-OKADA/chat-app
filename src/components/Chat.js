import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";
import '../index.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched Messages:", fetchedMessages); // 🔍 Debug log
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, []);  

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, "messages"), {
        text,
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
      });
      setText("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 text-center text-lg font-bold">
        <h2 className="text-2xl font-bold">Chat Room</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          // Format timestamp into a readable string
          const timestamp = msg.timestamp?.toDate().toLocaleString();
          return (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-xs ${
                msg.senderId?.trim() === auth.currentUser?.uid?.trim()
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-300 text-black self-start mr-auto"
              }`}
            >
              <p className="text-sm"><strong>Sender ID: </strong>{msg.senderId}</p> {/* Display senderId */}
              <p className="text-sm">{msg.text}</p> {/* Display message */}
              {timestamp && <p className="text-xs text-gray-500">{timestamp}</p>} {/* Display timestamp */}
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage} className="p-4 flex items-center gap-2 bg-white border-t">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Send
        </button>
      </form>
    </div>
  );
}
