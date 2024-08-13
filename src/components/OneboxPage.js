import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaInbox, FaPaperPlane, FaUser, FaSun, FaMoon, FaTrash, FaEnvelope, FaEye } from 'react-icons/fa';

const OneboxPage = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [allMessages, setAllMessages] = useState([]); // State to hold all messages in a thread
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [replyMessage, setReplyMessage] = useState(''); 
  const [isReplyBoxVisible, setReplyBoxVisible] = useState(false);
  const [allRepliesVisible, setAllRepliesVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const replyBoxRef = useRef(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      navigate('/onebox', { replace: true });
    } else {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        navigate('/');
        return;
      }

      axios.get('https://hiring.reachinbox.xyz/api/v1/onebox/list', {
        headers: { Authorization: `Bearer ${storedToken}` },
      }) .then((response) => {
        // Modify the subject field to remove text after '|'
        const modifiedData = response.data.data.map(item => {
          const modifiedSubject = item.subject.split('|')[0].trim(); // Keep text before '|'
          return { ...item, subject: modifiedSubject };
        });
        
        setThreads(modifiedData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError('Failed to load threads');
      });
    }
  }, [location, navigate]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'D' || e.key === 'd') {
        handleDeleteThread();
      }
      if (e.key === 'R' || e.key === 'r') {
        setReplyBoxVisible(true);
        replyBoxRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedThread]);

  const variables = [
    { name: 'From Name', value: 'fromName' },
    { name: 'To Name', value: 'toName' },
    { name: 'Subject', value: 'subject' }
  ];

  const handleThreadSelect = (thread) => {
    const storedToken = localStorage.getItem('authToken');
    setLoading(true);
  
    axios.get(`https://hiring.reachinbox.xyz/api/v1/onebox/messages/${thread.threadId}`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((response) => {
        const modifiedMessages = response.data.data.map(message => {
          const modifiedBody = message.body.replace(/<p>[^<]*<\/p>\s*$/, '');
          return { ...message, body: modifiedBody };
        });
        setSelectedThread(thread);
        setAllMessages(modifiedMessages); // Store all messages in the thread
        setLoading(false);
        setReplyBoxVisible(false); // Close reply box on thread selection
        setAllRepliesVisible(false); // Hide all replies on new thread selection
      })
      .catch((err) => {
        setLoading(false);
        setError('Failed to load the selected thread');
      });
  };
  

  const handleDeleteThread = () => {
    const storedToken = localStorage.getItem('authToken');
    if (selectedThread) {
      axios.delete(`https://hiring.reachinbox.xyz/api/v1/onebox/messages/${selectedThread.threadId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then(() => {
          setThreads(threads.filter(thread => thread.threadId !== selectedThread.threadId));
          setSelectedThread(null);
        })
        .catch((err) => {
          setError('Failed to delete the thread');
        });
    }
  };

  const handleResetOnebox = () => {
    const storedToken = localStorage.getItem('authToken');
    axios.get('https://hiring.reachinbox.xyz/api/v1/onebox/reset', {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        setError('Failed to reset Onebox');
      });
  };
  const handleReplySend = () => {
    const storedToken = localStorage.getItem('authToken');
    if (selectedThread) {
      const replyPayload = {
        toName: "Mitrajit",
        to:"chandra.rupam@gmail.com",
        from: "mitrajit2022@gmail.com", // Replace with the actual sender email
        fromName: "Mitrajit", // Replace with the actual sender name
        subject:  "Optimize Your Recruitment Efforts with Expert Support",
        body: `<p>${replyMessage}</p>`,
        references: [
            "<dea5a0c2-336f-1dc3-4994-191a0ad3891a@gmail.com>",
            "<CAN5Dvwu24av80BmEg9ZVDWaP2+hTOrBQn9KhjfFkZZX_Do88FA@mail.gmail.com>",
            "<CAN5DvwuzPAhoBEpQGRUOFqZF5erXc=B98Ew_5zbHF5dmeKWZMQ@mail.gmail.com>",
            "<a1383d57-fdee-60c0-d46f-6bc440409e84@gmail.com>"
        ],
        inReplyTo: "<a1383d57-fdee-60c0-d46f-6bc440409e84@gmail.com>",
      };
  
      axios.post(`https://hiring.reachinbox.xyz/api/v1/onebox/reply/${selectedThread.threadId}`, replyPayload, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then(() => {
        setReplyMessage('');
        setReplyBoxVisible(false); // Hide reply box after sending reply
        alert('Reply sent successfully');
      })
      .catch((err) => {
        if (err.response && err.response.status === 500) {
          alert('500: Internal server error occurred. Please try again later.');
        } else {
          alert('Failed to send the reply. Please check your connection or try again later.');
        }
        console.error('Error during reply sending:', err); // Log error for debugging
      });
    }
  };
  
  
const handleInsertVariable = (variable) => {
    if (variable) {
        setReplyMessage(replyMessage + `{{${variable}}}`);
        replyBoxRef.current?.focus();
    }
};

const handleReplySave = () => {
    if (selectedThread) {
        // Get actual values based on the selected thread
        const fromName = selectedThread.fromName;
        const toName = selectedThread.toName || "Mitrajit"; // Use toEmail if toName is not available
        const subject = selectedThread.subject;

        // Replace the placeholders with actual values
        let renderedMessage = replyMessage
            .replace('{{fromName}}', fromName)
            .replace('{{toName}}', toName)
            .replace('{{subject}}', subject);

        setReplyMessage(renderedMessage);
        
    } else {
        alert('No thread selected');
    }
};

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleViewAllReplies = () => {
    setAllRepliesVisible(true); // Ensure this flag is set when viewing all replies
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        {/* Top Navbar */}
        <div className="p-4 flex justify-center items-center bg-gray-800 text-white border-b border-gray-400">
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="Logo" className="w-10 h-10" />
            <span className="text-xl font-semibold">ReachInbox</span>
          </div>
        </div>
  
        {/* Loading Content */}
        <div className="flex flex-1 justify-center items-center">
          <img src="/loading.gif" alt="Loading..." className="w-16 h-16" />
        </div>
      </div>
    );
  }
  

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {/* Top Navbar */}
      <div className={`p-4 flex justify-between items-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} border-b border-gray-400`}>
        <div className="flex items-center space-x-4">
          <img src="/logo.png" alt="Logo" className="w-10 h-10" />
          <span className="text-xl font-semibold">Onebox</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleDarkMode} className="text-gray-400 hover:text-white">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={handleResetOnebox} className="text-gray-400 hover:text-white">Reset</button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Vertical Navbar */}
        <div className={`w-20 flex flex-col items-center space-y-8 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r border-gray-400`}>
          <FaHome className="text-2xl cursor-pointer" style={{ color: darkMode ? 'white' : 'black' }} />
          <FaSearch className="text-2xl cursor-pointer" style={{ color: darkMode ? 'white' : 'black' }} />
          <FaInbox className="text-2xl cursor-pointer" style={{ color: darkMode ? 'white' : 'black' }} />
          <FaPaperPlane className="text-2xl cursor-pointer" style={{ color: darkMode ? 'white' : 'black' }} />
          <FaUser className="text-2xl cursor-pointer" style={{ color: darkMode ? 'white' : 'black' }} />
        </div>

        <div className="flex flex-1">
          {/* Sidebar */}
          <div className={`w-1/4 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} border-r border-gray-400`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Inbox(s)</h2>
              <button className="text-gray-500 hover:text-white">&#x21bb;</button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span>{threads.length} New Replies</span>
              <span>Newest</span>
            </div>
            <div className="overflow-y-auto h-5/6">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-4 cursor-pointer border-b ${
                    selectedThread && selectedThread.id === thread.id
                      ? darkMode 
                        ? 'bg-gray-700'  // Dark mode selected thread background
                        : 'bg-gray-300'  // Light mode selected thread background
                      : darkMode 
                        ? 'hover:bg-gray-800'  // Dark mode hover effect
                        : 'hover:bg-gray-100'  // Light mode hover effect
                  }`}
                  onClick={() => handleThreadSelect(thread)}
                >
                  <p className="font-semibold">{thread.fromEmail}</p>
                  <p className="text-sm text-gray-400">{thread.subject}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="w-3/4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedThread ? selectedThread.fromName : 'Select a message'}
              </h2>
              <div className="flex space-x-2">
                <button onClick={handleDeleteThread} className="bg-red-600 px-4 py-2 rounded">
                  <FaTrash />
                </button>
                <button onClick={() => setReplyBoxVisible(true)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                  Reply
                </button>
              </div>
            </div>
            <div className={`p-4 rounded-md shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-400`}>
              {selectedThread ? (
                <div>
                  <p className="text-sm text-gray-400 mb-2">from: {selectedThread.fromEmail}</p>
                  <p className="text-sm text-gray-400 mb-2">to: {selectedThread.toEmail}</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {new Date(selectedThread.sentAt).toLocaleString()}
                  </p>
                  <div
                    className="text-gray-300"
                    dangerouslySetInnerHTML={{ __html: selectedThread.body }}
                  />
                  {!allRepliesVisible && (
                    <button
                      onClick={handleViewAllReplies}
                      className="mt-4 text-blue-500 hover:underline"
                    >
                      View all replies
                    </button>
                  )}
                 {allRepliesVisible && (
  <div className="mt-4">
   {allRepliesVisible && (
  <div className="mt-4">
    {allMessages
      .filter(message => message.messageId !== selectedThread.messageId) // Exclude the already displayed message
      .map((message, index) => (
        <div key={index} className="mb-4">
          <p className="text-sm text-gray-400">from: {message.fromEmail}</p>
          <p className="text-sm text-gray-400">
          {new Date(selectedThread.sentAt).toLocaleString()}
          </p>
          <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: message.body }} />
        </div>
      ))}
  </div>
)}

  </div>
)}

                  {isReplyBoxVisible && (
                    <div>
                      <div className="flex space-x-2 mb-2 mt-4">
                      <button onClick={handleReplySend} className="bg-blue-600 px-3 py-1 text-sm rounded">SEND</button>
                        <button onClick={handleReplySave} className="bg-green-600 px-3 py-1 text-sm rounded">SAVE</button>
                        <select 
  onChange={(e) => handleInsertVariable(e.target.value)} 
  className="bg-yellow-600 px-3 py-1 text-sm rounded"
  value="" // Add an empty value to ensure the placeholder is shown after selection
>
  <option value="" disabled>Select Variable</option>
  <option value="fromName">From Name</option>
  <option value="toName">To Name</option>
  <option value="subject">Subject</option>
</select>
  </div>
                      <textarea
                        ref={replyBoxRef}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply here..."
                        className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">Select a thread to view its content.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar for Lead Details and Activities */}
          {selectedThread && (
            <div className="w-1/3 p-4">
              <div className={`p-4 rounded-md shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} border border-gray-400 mb-4`}>
                <h3 className="text-lg font-semibold mb-4">Lead Details</h3>
                <p className="mb-2"><strong>Name:</strong> {selectedThread.fromName}</p>
                <p className="mb-2"><strong>Contact No:</strong> +54-9062648321</p>
                <p className="mb-2"><strong>Email ID:</strong> {selectedThread.fromEmail}</p>
                <p className="mb-2"><strong>LinkedIn:</strong> <a href="#" className="text-blue-500">linkedin.com/in/username</a></p>
              </div>
              <div className={`p-4 rounded-md shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} border border-gray-400`}>
                <h3 className="text-lg font-semibold mb-4">Activities</h3>
                <p className="mb-2"><strong>Campaign Name:</strong> ReachInbox</p>
                <div className="mb-2">
                  <p><strong>Step 1:</strong> Email</p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <FaEnvelope className="mr-2" /> Sent (3rd Feb)
                  </p>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-400 flex items-center">
                    <FaEye className="mr-2" /> Opened (5th Feb)
                  </p>
                </div>
                <div className="mb-2">
                  <p><strong>Step 2:</strong> Email</p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <FaEye className="mr-2" /> Opened (5th Feb)
                  </p>
                </div>
                <div className="mb-2">
                  <p><strong>Step 3:</strong> Email</p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <FaEye className="mr-2" /> Opened (5th Feb)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OneboxPage;
