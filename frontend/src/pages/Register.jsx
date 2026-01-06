import logo from '../assets/logo.CC.png'
import '../styles/Register.css'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function RegisterScreen() {
  const [showPwd, setShowPwd] = useState(true);
  const navigate = useNavigate();
  const togglePwd = () => setShowPwd((v) => !v);

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = document.getElementById('register-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    form.reset();
    setShowPwd(true);
    try {
      const res = await fetch('http://localhost:3000/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem('jwtoken', result.token);
        navigate('/');
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (err) {
      alert('Network error, please try again later.');
    }
  };

  return (
    <div className='App' style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
      <div style={{ width: '100%', maxWidth: '350px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="register-logo" style={{ marginBottom: '0.8rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <img src={logo} alt="CodeCanvas Logo" className="register-logo-img" style={{ maxWidth: '100px', width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        <form id="register-form" onSubmit={handleRegister} style={{ width: '100%', color: '#f8f8f2', marginBottom: '0.8rem' }}>
            <div className="form-group">
            <label htmlFor="username" className="form-label" style={{ color: '#f8f8f2', fontSize: '0.95rem' }}>USERNAME</label>
            <input type="text" className="form-input" id="username" name="username" placeholder="Username" required autoComplete="username" style={{ background: '#101820', color: '#f8f8f2', border: '1.5px solid #1e90ff', borderRadius: '8px', fontSize: '0.95rem', padding: '8px' }} />
            </div>
            <div className="form-group">
            <label htmlFor="email" className="form-label" style={{ color: '#f8f8f2', fontSize: '0.95rem' }}>EMAIL</label>
            <input type="email" className="form-input" id="email" name="email" placeholder="Email" required autoComplete="email" style={{ background: '#101820', color: '#f8f8f2', border: '1.5px solid #1e90ff', borderRadius: '8px', fontSize: '0.95rem', padding: '8px' }} />
            </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password" className="form-label" style={{ color: '#f8f8f2', fontSize: '0.95rem' }}>PASSWORD</label>
            <input
              type={showPwd ? "password" : "text"}
              id="password"
              className="form-input"
              name="password"
              placeholder="Password"
              required
              autoComplete="new-password"
              style={{ background: '#101820', color: '#f8f8f2', border: '1.5px solid #1e90ff', borderRadius: '8px', fontSize: '0.95rem', padding: '8px', paddingRight: '2.2em' }}
            />
            </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem', marginTop: '-1.2rem' }}>
            <input
              type="checkbox"
              className="checkbox"
              id="showpassword"
              checked={!showPwd ? true : false}
              onChange={togglePwd}
              style={{ marginRight: '0.5em' }}
            />
            <label htmlFor="showpassword" className="checkbox-label" style={{ color: '#f8f8f2', fontSize: '0.95rem', cursor: 'pointer' }}>
              Show Password
            </label>
            </div>
          <button type="Submit" className="register-button" style={{ background: 'linear-gradient(135deg, #bd93f9 0%, #8be9fd 100%)', color: '#282a36', fontWeight: 700, borderRadius: '10px', width: '100%', padding: '10px', fontSize: '1rem', marginTop: '0.5rem' }}>Register</button>
        </form>
        <div className="register-footer" style={{ color: '#f8f8f2', textAlign: 'center', fontSize: '0.95rem', marginTop: 0 }}>
          <p style={{ margin: 0 }}>Already have an account? <a href="/login" style={{ color: '#8be9fd', textDecoration: 'underline' }}>Login</a></p>
      </div>
      </div>
    </div>
  )
}

export default RegisterScreen;
