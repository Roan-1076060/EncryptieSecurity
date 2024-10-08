import React, { useState, useEffect, KeyboardEvent } from 'react';
//@ts-ignore Since its a JavaScript library in a TypeScript project
import CryptoJS from 'crypto-js';
import './index.css';

function App() {
  //States
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; text: string; timestamp: number }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    //Check for login value
    const savedLoggedIn = localStorage.getItem('loggedIn');
    if (savedLoggedIn === 'true') {
      setLoggedIn(true);
      const savedKey = localStorage.getItem('privateKey');
      if (savedKey) {
        setPrivateKey(savedKey);
        loadNotes(savedKey);
      }
    }
  }, []);

  const loadNotes = (key: string) => {
    //Loads encrypted Notes
    const encryptedNotes = JSON.parse(localStorage.getItem('encryptedNotes') || '[]');

    //For each note, decrypt them using the Password Hash
    const decryptedNotes = encryptedNotes.map((encNote: string) => {
      try {
        const bytes = CryptoJS.AES.decrypt(encNote, key);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decryptedData;
      } catch (e) {
        return { id: 'error', text: 'Wrong private key for this note', timestamp: Date.now() };
      }
    });
    setNotes(decryptedNotes);
  };

  const handleLogin = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    // Hashes the password
    const key = CryptoJS.SHA256(password).toString();

    //Password hash is set as the private key 
    setPrivateKey(key);
    setLoggedIn(true);

    //Storage handling
    localStorage.setItem('loggedIn', 'true');
    //Private key is set
    localStorage.setItem('privateKey', key);
    loadNotes(key);
    setPassword('');
    setError('');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setPrivateKey('');
    setNotes([]);
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('privateKey');
  };

  const handleAddNote = () => {
    //Ads date to the note
    if (!note.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      text: note.trim(),
      timestamp: Date.now(),
    };

    //Encrypts the note and adds it to the list
    const encryptedNote = CryptoJS.AES.encrypt(JSON.stringify(newNote), privateKey).toString();
    const encryptedNotes = JSON.parse(localStorage.getItem('encryptedNotes') || '[]');
    encryptedNotes.push(encryptedNote);
    localStorage.setItem('encryptedNotes', JSON.stringify(encryptedNotes));
    setNotes([newNote, ...notes]);
    setNote('');
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    const encryptedNotes = updatedNotes.map(note =>
      CryptoJS.AES.encrypt(JSON.stringify(note), privateKey).toString()
    );
    localStorage.setItem('encryptedNotes', JSON.stringify(encryptedNotes));
  };

  const filteredNotes = notes.filter(note =>
    //Search function
    note.text.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, action: () => void) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission
      action();
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {!loggedIn ? (
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-extrabold text-teal-600 text-center">Secure Notes</h2>
            <div className="relative">
              <input
                className="w-full p-4 bg-gray-100 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
              />
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-full transition duration-300 transform hover:scale-105"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-teal-600">Your Secure Notes</h2>
              <button
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
            <input
              className="w-full p-4 bg-gray-100 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="bg-gray-100 rounded-2xl p-6 space-y-4 max-h-64 overflow-y-auto">
              {filteredNotes.length > 0 ? (
                <ul className="space-y-3">
                  {filteredNotes.map((n) => (
                    <li key={n.id} className="bg-white p-4 rounded-xl shadow-md">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-800">{n.text}</span>
                        <button
                          className="text-red-500 hover:text-red-700 ml-2 transition duration-300"
                          onClick={() => handleDeleteNote(n.id)}
                        >
                          ✖
                        </button>
                      </div>
                      <small className="text-gray-500 text-xs block mt-2">
                        {new Date(n.timestamp).toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No notes yet. Add one below!</p>
              )}
            </div>
            <div className="space-y-4">
              <textarea
                className="w-full p-4 bg-gray-100 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                placeholder="Enter your note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddNote)}
                rows={3}
              />
              <button
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-full transition duration-300 transform hover:scale-105"
                onClick={handleAddNote}
              >
                Add Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
}  
export default App;
