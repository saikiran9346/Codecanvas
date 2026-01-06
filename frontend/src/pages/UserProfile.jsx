import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfile.css';
import EditProfile from '../components/EditProfile';
import Toast from '../components/Toast';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profilePicture: '',
    codeforcesHandle: '',
    codeforcesRating: '',
    programmingLanguages: [],
    skills: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [cfInfo, setCfInfo] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // useEffect(() => {
  //     let storedData = localStorage.getItem('userData');
  //       if (storedData) {
  //         storedData = JSON.parse(storedData);
  //         console.log('Stored user data:', storedData);
  //         setUserData(storedData);
  //         if (storedData.codeforcesHandle) {
  //           fetchCodeforcesInfo(storedData.codeforcesHandle);
  //         }
  //       }
  //   }, []);

  // Fetch user data (replace with your actual API call)
  useEffect(() => {
    const fetchUserData = async () => {
      const jwtoken = localStorage.getItem('jwtoken');
      try {
        const res = await fetch('http://localhost:3000/user/profile',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtoken}`
            },
          }
        );
        const data = await res.json();
        // console.log(data);
        setUserData(data);
        if (data.codeforcesHandle) {
          fetchCodeforcesInfo(data.codeforcesHandle);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('jwtoken');
    if (!token) navigate('/login');
  });

  // Fetch Codeforces info (handles array response)
  const fetchCodeforcesInfo = async (handle) => {
    try {
      const res = await fetch(`https://competeapi.vercel.app/user/codeforces/${handle}/`);
      const data = await res.json();
      // If data is an array, use first element; else use data itself
      const info = Array.isArray(data) ? data[0] : data;
      setCfInfo(info);
      // Optional: Also update codeforcesRating in userData if you want to store it
      // setUserData(prev => ({ ...prev, codeforcesRating: info?.rating ?? '' }));
    } catch (error) {
      console.error('Error fetching Codeforces info:', error);
      setCfInfo(null); // Clear on error
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleProfileUpdate = async (updatedData) => {
    try {
      const jwtoken = localStorage.getItem('jwtoken');
      const res = await fetch('http://localhost:3000/user/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtoken}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      const data = await res.json();
      setUserData(data.user || updatedData); // Prefer backend's updated user
      setIsEditing(false); // <-- This ensures you exit edit mode
      showToastMessage('Profile updated successfully!');
      if ((data.user || updatedData).codeforcesHandle) {
        fetchCodeforcesInfo((data.user || updatedData).codeforcesHandle);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToastMessage('Failed to update profile. Please try again.');
    }
  };

  if (isEditing) {
    return <EditProfile userData={userData} onUpdate={handleProfileUpdate} showToast={showToastMessage} />;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{userData.name}</h1>
        <p className="profile-email">{userData.email}</p>
      </div>

      <div className="profile-picture-box">
        <img
          src={
            userData.profilePicture && userData.profilePicture.trim() !== ""
              ? userData.profilePicture
              : "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png"
          }
          alt="Profile"
          className="profile-pic"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png";
          }}
        />
      </div>

      <div className="codeforces-section">
        <h3>
            Codeforces Handle: 
            <span className="codeforces-handle">
                {userData.codeforcesHandle || 'Not set'}
            </span>
        </h3>
        <p>
            Rating: 
            {userData.codeforcesHandle && cfInfo === null ? (
              <span className="cf-rating-skeleton" />
            ) : (
              <span className={cfInfo?.rating && cfInfo.rating >= 1000 ? 'rating high' : 'rating'}>
                {cfInfo?.rating ?? 'N/A'}
              </span>
            )}
        </p>
      </div>

      <div className="skills-section">
        <h3 className="skills-title">Programming Languages</h3>
        {(Array.isArray(userData.programmingLanguages) && userData.programmingLanguages.length > 0) ? (
          <ul>
            {userData.programmingLanguages.map((lang, i) => (
              <li key={i} className="skill-item">{lang}</li>
            ))}
          </ul>
        ) : <p>No languages listed</p>}

        <h3 className="skills-title">Skills</h3>
        {(Array.isArray(userData.skills) && userData.skills.length > 0) ? (
          <ul>
            {userData.skills.map((skill, i) => (
              <li key={i} className="skill-item">{skill}</li>
            ))}
          </ul>
        ) : <p>No skills listed</p>}
      </div>
      
      <button onClick={handleEdit} className="edit-btn">Edit Profile</button>

      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default UserProfile;

