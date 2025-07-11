'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('group');
  const [room, setRoom] = useState('creators');
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupInput, setGroupInput] = useState('');
  const [supportMessages, setSupportMessages] = useState([
    { sender: 'ai', message: "Hi there! I'm your AI assistant. How can I help you today?" }
  ]);
  const [supportInput, setSupportInput] = useState('');
  const [privateMessages, setPrivateMessages] = useState([]);
  const [privateInput, setPrivateInput] = useState('');
  const [receiver, setReceiver] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push('/login');
      setUser(data.user);
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('realtime-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        if (msg.room === room && activeTab === 'group') {
          setGroupMessages((prev) => [...prev, msg]);
        }
        if ((msg.sender === user.id || msg.receiver === user.id) && activeTab === 'private') {
          setPrivateMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room, user, activeTab]);

  useEffect(() => {
    if (user) {
      fetchGroupMessages();
      fetchUsers();
    }
  }, [room, user]);

  useEffect(() => {
    if (activeTab === 'private' && user && receiver) fetchPrivateMessages();
  }, [receiver, activeTab, user]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('id, name, avatar');
    if (!error) setAllUsers(data.filter(u => u.id !== user.id));
  };

  const fetchGroupMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room', room)
      .order('sent_at', { ascending: true });
    if (!error) setGroupMessages(data);
  };

  const fetchPrivateMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender.eq.${user.id},receiver.eq.${user.id}`)
      .order('sent_at', { ascending: true });

    if (!error) {
      const filtered = data.filter(msg => msg.receiver === receiver || msg.sender === receiver);
      setPrivateMessages(filtered);
    }
  };

  const sendGroupMessage = async () => {
    if (!groupInput.trim()) return;
    await supabase.from('messages').insert({ sender: user.id, message: groupInput, room });
    setGroupInput('');
  };

  const sendSupportMessage = async () => {
    if (!supportInput.trim()) return;

    const message = supportInput;
    setSupportMessages(prev => [...prev, { sender: 'user', message }]);
    setSupportInput('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      if (data.status === 'success' && data.reply) {
        setSupportMessages(prev => [...prev, { sender: 'ai', message: data.reply }]);
      } else {
        setSupportMessages(prev => [...prev, { sender: 'ai', message: 'AI assistant failed to respond.' }]);
      }
    } catch (error) {
      console.error('Support Chat Error:', error);
      setSupportMessages(prev => [...prev, { sender: 'ai', message: 'AI assistant failed to respond.' }]);
    }
  };

  const sendPrivateMessage = async () => {
    if (!privateInput.trim()) return;
    await supabase.from('messages').insert({ sender: user.id, receiver, message: privateInput });
    setPrivateInput('');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <aside className="sidebar" id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard"><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile"><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/services"><i className="fas fa-briefcase"></i> My Services</a></li>
            <li><a href="/dashboard/messages" className="active"><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/settings"><i className="fas fa-cog"></i> Settings</a></li>
            <li>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px' }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <div className="user-info">
            <span>Messages</span>
            <img src="https://i.pravatar.cc/100" alt="User Profile" />
          </div>
        </header>

        <section className="chat-section">
          <div className="chat-tabs">
            {['group', 'support', 'private'].map(tab => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'group' ? 'Group Chat' : tab === 'support' ? 'Support Chat' : 'Private Messages'}
              </button>
            ))}
          </div>

          {activeTab === 'group' && (
            <div className="chat-box active">
              <select value={room} onChange={(e) => setRoom(e.target.value)}>
                <option value="creators">Content Creators</option>
                <option value="developers">Developers</option>
                <option value="marketers">Marketers</option>
              </select>
              <div className="chat-messages">
                {groupMessages.map((msg, i) => (
                  <div key={i} className="message user">[{msg.room}] {msg.sender}: {msg.message}</div>
                ))}
              </div>
              <div className="chat-input">
                <input type="text" value={groupInput} onChange={(e) => setGroupInput(e.target.value)} placeholder="Type your message..." />
                <button onClick={sendGroupMessage}><i className="fas fa-paper-plane"></i></button>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="chat-box active">
              <div className="chat-messages">
                {supportMessages.map((msg, i) => (
                  <div key={i} className={`message ${msg.sender}`}>{msg.message}</div>
                ))}
              </div>
              <div className="chat-input">
                <input type="text" value={supportInput} onChange={(e) => setSupportInput(e.target.value)} placeholder="Ask something..." />
                <button onClick={sendSupportMessage}><i className="fas fa-paper-plane"></i></button>
              </div>
            </div>
          )}

          {activeTab === 'private' && (
            <div className="chat-box active">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select value={receiver} onChange={(e) => setReceiver(e.target.value)}>
                {allUsers.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.id}</option>
                ))}
              </select>
              <div className="chat-messages">
                {privateMessages.map((msg, i) => (
                  <div key={i} className={`message user ${msg.sender === user.id ? 'sent' : 'received'}`}>{msg.message}</div>
                ))}
              </div>
              <div className="chat-input">
                <input type="text" value={privateInput} onChange={(e) => setPrivateInput(e.target.value)} placeholder="Send a private message..." />
                <button onClick={sendPrivateMessage}><i className="fas fa-paper-plane"></i></button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
