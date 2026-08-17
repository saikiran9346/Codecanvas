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
    <div className='App'>
      <div className="register-container">
        <div className="logo">
              <img src={logo} alt="NXT Watch Logo" className="logo" />
        </div>
        <form id="register-form" onSubmit={handleRegister}>
            <div className="form-group">
                <label htmlFor="username" className="form-label">USERNAME</label>
                <input type="text" className="form-input" id="username" name="username" placeholder="Username" required autoComplete="username" />
            </div>
            <div className="form-group">
                <label htmlFor="email" className="form-label">EMAIL</label>
                <input type="email" className="form-input" id="email" name="email" placeholder="Email" required autoComplete="email" />
            </div>
            <div className="form-group">
                <label htmlFor="password" className="form-label">PASSWORD</label>
                <input type={showPwd ? "password" : "text"} id="password" className="form-input" name="password" placeholder="Password" required autoComplete="new-password" />
            </div>
            <div className="checkbox-container">
                <input type="checkbox" className="checkbox" id="showpassword" onChange={togglePwd} />
                <label htmlFor="showpassword" className="checkbox-label">Show Password</label>
            </div>
            <button type="Submit" className="register-button">Register</button>
        </form>
      </div>
      <div className="register-footer">
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  )
}

export default RegisterScreen;
