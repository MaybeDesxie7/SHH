'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MyServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return router.push('/login');

      const { data, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (serviceError) console.error(serviceError);
      else setServices(data || []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      ...form,
      price: parseFloat(form.price),
      user_id: user.id
    };

    let response;
    if (editId) {
      response = await supabase.from('services').update(payload).eq('id', editId);
    } else {
      response = await supabase.from('services').insert(payload);
    }

    if (response.error) alert(response.error.message);
    else {
      setForm({ title: '', description: '', price: '', category: '' });
      setEditId(null);
      fetchServices();
    }
  };

  const fetchServices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setServices(data);
  };

  const handleEdit = (service) => {
    setForm({
      title: service.title,
      description: service.description,
      price: service.price,
      category: service.category
    });
    setEditId(service.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchServices();
  };

  if (loading) return <p>Loading services...</p>;

  return (
    <div className="dashboard">
      <aside className="sidebar" id="sidebar">
        <div className="logo">Smart Hustle Hub</div>
        <nav>
          <ul>
            <li><a href="/dashboard"><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/dashboard/profile"><i className="fas fa-user"></i> Profile</a></li>
            <li><a href="/dashboard/services" className="active"><i className="fas fa-briefcase"></i> My Services</a></li>
            <li><a href="/dashboard/messages"><i className="fas fa-envelope"></i> Messages</a></li>
            <li><a href="/dashboard/tools"><i className="fas fa-toolbox"></i> Tools</a></li>
            <li><a href="/dashboard/ebooks"><i className="fas fa-book"></i> Ebooks</a></li>
            <li><a href="/dashboard/tutorials"><i className="fas fa-video"></i> Tutorials</a></li>
            <li><a href="/dashboard/offers"><i className="fas fa-tags"></i> Offers</a></li>
            <li><a href="/dashboard/help_center"><i className="fas fa-question-circle"></i> Help Center</a></li>
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
            <span>Manage Your Services</span>
            <img src="https://i.pravatar.cc/100" alt="User" />
            <button id="toggleModeBtn" title="Toggle Light/Dark Mode">
              <i className="fas fa-adjust"></i>
            </button>
            <button id="toggleMenuBtn" title="Toggle Menu">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>

        <section className="services-section">
          <h2><i className="fas fa-briefcase"></i> {editId ? 'Update Service' : 'Add a New Service'}</h2>
          <form onSubmit={handleSubmit}>
            <label>Title: <input name="title" value={form.title} onChange={handleChange} required /></label>
            <label>Description: <textarea name="description" value={form.description} onChange={handleChange} required /></label>
            <label>Price: <input name="price" type="number" value={form.price} onChange={handleChange} required /></label>
            <label>Category: <input name="category" value={form.category} onChange={handleChange} required /></label>
            <button type="submit" className="save-btn">{editId ? 'Update' : 'Add'} Service</button>
          </form>

          <h2><i className="fas fa-list"></i> Your Services</h2>
          <ul className="services-list">
            {services.map(service => (
              <li key={service.id} className="service-card">
                <h3>{service.title}</h3>
                <p className="service-meta">Category: {service.category} | Price: ${service.price}</p>
                <p>{service.description}</p>
                <button onClick={() => handleEdit(service)}>Edit</button>
                <button onClick={() => handleDelete(service.id)} style={{ background: 'red', color: 'white' }}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
} // End of Component
