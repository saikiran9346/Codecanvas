import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SolutionsList.css';

const SolutionsList = () => {
  const { titleSlug } = useParams();
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const token = localStorage.getItem('jwtoken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/solutions/${titleSlug}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setSolutions(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch solutions');
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [titleSlug, navigate]);

  const handleSolutionClick = (solutionId) => {
    navigate(`/solution/${solutionId}`);
  };

  if (loading) {
    return <div className="loading">Loading solutions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="solutions-list-container">
      <div className="solutions-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Solutions for {titleSlug}</h1>
      </div>

      {solutions.length === 0 ? (
        <div className="no-solutions">No solutions available yet.</div>
      ) : (
        <div className="solutions-grid">
          {solutions.map((solution) => (
            <div
              key={solution._id}
              className="solution-card"
              onClick={() => handleSolutionClick(solution._id)}
            >
              <div className="solution-header">
                <span className="author">{solution.author.Username}</span>
                <span className="date">
                  {new Date(solution.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="solution-meta">
                <span className="language">{solution.language}</span>
                <span className="votes">{solution.votes} votes</span>
              </div>
              <pre className="solution-preview">
                {solution.code.substring(0, 200)}
                {solution.code.length > 200 ? '...' : ''}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolutionsList;