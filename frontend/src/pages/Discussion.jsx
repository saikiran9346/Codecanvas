// src/components/Discussions.js
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import Loader from "./Loader";
import "../styles/Discussion.css";

const Discussions = () => {
  const navigate = useNavigate();
  const { titleSlug } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState({});
  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const jwtoken = localStorage.getItem("jwtoken");
    if (!jwtoken) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchDiscussions();
  }, [titleSlug]);

  const fetchDiscussions = async () => {
    try {
      const res = await axios.get(`${backend}/discussions/${titleSlug}`);
      console.log('Fetched discussions:', res.data); // Debug log
      setDiscussions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching discussions:', err); // Debug log
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtoken");
      const res = await axios.post(
        `${backend}/discussions`,
        {
          ...newDiscussion,
          problemSlug: titleSlug,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDiscussions([res.data, ...discussions]);
      setNewDiscussion({ title: "", content: "" });
    } catch (err) {
      console.error('Error creating discussion:', err); // Debug log
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleAddComment = async (discussionId) => {
    try {
      const token = localStorage.getItem("jwtoken");
      const res = await axios.post(
        `${backend}/discussions/${discussionId}/comments`,
        { content: newComment[discussionId] },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDiscussions(
        discussions.map((disc) =>
          disc._id === discussionId ? res.data : disc
        )
      );
      setNewComment({ ...newComment, [discussionId]: "" });
    } catch (err) {
      console.error('Error adding comment:', err); // Debug log
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleVote = async (discussionId, voteType) => {
    try {
      const token = localStorage.getItem("jwtoken");
      const res = await axios.post(
        `${backend}/discussions/${discussionId}/vote`,
        { voteType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDiscussions(
        discussions.map((disc) =>
          disc._id === discussionId ? res.data : disc
        )
      );
    } catch (err) {
      console.error('Error voting:', err); // Debug log
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="loading">Loading discussions...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="discussions-container">
      <h1>Discussions for {titleSlug}</h1>
      
      {/* Create new discussion form */}
      <form onSubmit={handleCreateDiscussion} className="new-discussion-form">
        <input
          type="text"
          placeholder="Discussion Title"
          value={newDiscussion.title}
          onChange={(e) =>
            setNewDiscussion({ ...newDiscussion, title: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Discussion Content"
          value={newDiscussion.content}
          onChange={(e) =>
            setNewDiscussion({ ...newDiscussion, content: e.target.value })
          }
          required
        />
        <button type="submit">Create Discussion</button>
      </form>

      {/* Discussions list */}
      <div className="discussions-list">
        {discussions.length === 0 ? (
          <p>No discussions found yet. Be the first to start one!</p>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion._id} className="discussion-card">
              <div className="discussion-header">
                <span className="author">{discussion.author.Username}</span>
                <span className="date">
                  {new Date(discussion.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="discussion-body">
                <h2>{discussion.title}</h2>
                <p>{discussion.content}</p>
              </div>
              <div className="discussion-actions">
                <button
                  onClick={() => handleVote(discussion._id, "upvote")}
                  className="vote-btn"
                >
                  ↑
                </button>
                <span className="votes">{discussion.votes}</span>
                <button
                  onClick={() => handleVote(discussion._id, "downvote")}
                  className="vote-btn"
                >
                  ↓
                </button>
              </div>

              {/* Comments section */}
              <div className="comments-section">
                <h3>Comments</h3>
                {discussion.comments && discussion.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <div className="comment-header">
                      <span className="author">{comment.author.Username}</span>
                      <span className="date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
                <div className="new-comment">
                  <textarea
                    placeholder="Add a comment..."
                    value={newComment[discussion._id] || ""}
                    onChange={(e) =>
                      setNewComment({
                        ...newComment,
                        [discussion._id]: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() => handleAddComment(discussion._id)}
                    disabled={!newComment[discussion._id]}
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Discussions;
