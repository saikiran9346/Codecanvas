// 30-05-2025 8:00 pm

import React, { useState } from "react";
import axios from "axios";

const EditProfile = ({ userData, onUpdate, showToast }) => {
  // Local state for editable fields (initialize with current user data)
  const [formData, setFormData] = useState({ ...userData });
  // Local state for password section
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Cancel should reset edits to original data
  const handleCancel = () => {
    setFormData({ ...userData });
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    if (typeof onUpdate === "function") {
      onUpdate(userData); // Just to exit edit mode
    }
  };

  // Handle profile field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile picture file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const jwtoken = localStorage.getItem("jwtoken");
      if (!jwtoken) {
        throw new Error("No authentication token found");
      }

      // 1. Update Profile Details
      const profilePromise = axios.post(
        "http://localhost:3000/user/profile/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 2. Update Password if new one is provided
      let passwordPromise = Promise.resolve(); // Resolves immediately if no password change
      if (passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          showToast && showToast("New passwords do not match.");
          return; // Stop if passwords mismatch
        }
        passwordPromise = axios.post(
          "http://localhost:3000/user/profile/update-password",
          {
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${jwtoken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Wait for both promises to complete
      const [profileResponse] = await Promise.all([
        profilePromise,
        passwordPromise,
      ]);

      showToast && showToast("Profile updated successfully!");
      
      // Reset password fields after successful save
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });

      if (onUpdate) {
        onUpdate(profileResponse.data.user); // Exit edit mode and update parent state
      }

    } catch (err) {
      console.error("Update error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "An error occurred.";
      showToast && showToast(`Update failed: ${errorMessage}`);
    }
  };

  return (
    <div className="edit-profile-container" style={{ background: 'rgba(20,30,48,0.92)', color: '#fff', borderRadius: '16px', padding: '2rem' }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSave}>
        <div className="edit-section">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              autoComplete="tel"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }} />
          </div>
          <div className="form-group">
            <label htmlFor="codeforcesHandle">Codeforces Handle</label>
            <input
              type="text"
              id="codeforcesHandle"
              name="codeforcesHandle"
              value={formData.codeforcesHandle}
              onChange={handleChange}
              autoComplete="off"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="programmingLanguages">Programming Languages (comma separated)</label>
            <input
              type="text"
              id="programmingLanguages"
              name="programmingLanguages"
              value={(formData.programmingLanguages || []).join(", ")}
              onChange={(e) => {
                const langs = e.target.value.split(",").map((l) => l.trim());
                setFormData((prev) => ({
                  ...prev,
                  programmingLanguages: langs,
                }));
              }}
              autoComplete="off"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="skills">Skills (comma separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={(formData.skills || []).join(", ")}
              onChange={(e) => {
                const skills = e.target.value.split(",").map((s) => s.trim());
                setFormData((prev) => ({
                  ...prev,
                  skills,
                }));
              }}
              autoComplete="off"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
        </div>

        <div className="edit-section password-section">
          <h3>Change Password</h3>
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
            Leave fields blank if you do not wish to change your password.
          </p>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              style={{ background: '#101820', color: '#fff', border: '1.5px solid #1e90ff', borderRadius: '8px' }}
            />
          </div>
        </div>

        <div className="button-row">
          <button type="submit" className="update-btn">
            Save All Changes
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
