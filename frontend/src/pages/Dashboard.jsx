import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from 'use-debounce';
import ProblemCard from "../components/Problemcard";
import "../styles/Dashboard.css";
import Loader from "../components/Loader";

function DashboardPage() {
  const navigate = useNavigate();
  const [problemList, setProblemList] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [tagFilterMode, setTagFilterMode] = useState("OR");
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    const token = localStorage.getItem("jwtoken");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchAllProblems = async () => {
      try {
        const res = await axios.get(`https://leetcode-api-mu.vercel.app/problems?limit=200`);
        const problems = res.data.problemsetQuestionList;
        setProblemList(problems);

        // Dynamically generate the list of all unique tags
        const tagSet = new Set();
        problems.forEach(prob => {
          prob.topicTags.forEach(tag => tagSet.add(tag.name));
        });
        setAllTags(Array.from(tagSet).sort());

      } catch (err) {
        console.error("Problem fetch error:", err);
      }
    };
    fetchAllProblems();
  }, []);

  const handleTagToggle = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredProblems = useMemo(() => {
    return problemList
      .filter(prob => {
        if (debouncedSearchTerm && !prob.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      .filter(prob => {
        if (activeTags.length === 0) return true;
        const tagNames = prob.topicTags.map((t) => t.name);
        return tagFilterMode === "OR"
          ? activeTags.some((tag) => tagNames.includes(tag))
          : activeTags.every((tag) => tagNames.includes(tag));
      });
  }, [problemList, debouncedSearchTerm, activeTags, tagFilterMode]);

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <input
          type="text"
          placeholder="Search problems..."
          className="filter-search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="tag-cloud">
          {allTags.map((tag) => (
            <div
              key={tag}
              className={`tag-cloud-item ${activeTags.includes(tag) ? "selected" : ""}`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      </aside>
      <main className="dashboard-main">
        <div className="active-filters">
          Active Filters:
          {activeTags.length > 0 ? (
            activeTags.map(tag => <span key={tag} className="filter-tag">{tag}</span>)
          ) : (
            <span>None</span>
          )}
          <button
            onClick={() => setTagFilterMode(prev => (prev === "OR" ? "AND" : "OR"))}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '5px', position: 'relative' }}
            aria-label="Toggle between OR (any tag) and AND (all tags) filter mode"
            onMouseEnter={e => {
              const tooltip = e.currentTarget.querySelector('.filter-tooltip');
              if (tooltip) tooltip.style.opacity = 1;
            }}
            onMouseLeave={e => {
              const tooltip = e.currentTarget.querySelector('.filter-tooltip');
              if (tooltip) tooltip.style.opacity = 0;
            }}
          >
            {tagFilterMode}
            <span className="filter-tooltip">Toggle between OR (any tag) and AND (all tags) filter mode</span>
          </button>
        </div>
        <div className="problems-grid">
          {problemList.length === 0 ? (
            // Skeleton loader cards
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="problem-card skeleton-card">
                <div className="skeleton-title" />
                <div className="skeleton-tags" />
                <div className="skeleton-difficulty" />
              </div>
            ))
          ) : (
            filteredProblems.map((prob) => (
              <ProblemCard
                key={prob.titleSlug}
                title={prob.title}
                difficulty={prob.difficulty}
                tags={prob.topicTags}
                titleSlug={prob.titleSlug}
                questionFrontendId={prob.questionFrontendId}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
