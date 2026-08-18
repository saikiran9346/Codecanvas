import axios from "axios";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import ProblemCard from "../components/Problemcard";
import "../styles/Dashboard.css";

const TOTAL_TARGET_PROBLEMS = 2000;
const BATCH_SIZE = 100;
const TOTAL_BATCHES = TOTAL_TARGET_PROBLEMS / BATCH_SIZE; // 20 batches

function DashboardPage() {
  const navigate = useNavigate();
  const problemsTopRef = useRef(null);

  const [problemList, setProblemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [allTags, setAllTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [tagFilterMode, setTagFilterMode] = useState("OR");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 250);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  useEffect(() => {
    const token = localStorage.getItem("jwtoken");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchAllProblemsInBatches = async () => {
      try {
        setLoading(true);

        // Batch 1: Quick fetch first 300 problems for instant rendering
        const initialRequests = [0, 100, 200].map((skip) =>
          axios
            .get(`https://leetcode-api-mu.vercel.app/problems?skip=${skip}&limit=100`, { timeout: 10000 })
            .then((res) => res.data?.problemsetQuestionList || [])
            .catch(() => [])
        );

        const initialResults = await Promise.all(initialRequests);
        if (!isMounted) return;

        let accumulated = initialResults.flat();
        setProblemList(accumulated);
        setLoadingProgress(Math.round((accumulated.length / TOTAL_TARGET_PROBLEMS) * 100));
        setLoading(false);

        // Batch 2: Fetch remaining 1200 problems concurrently in background
        const remainingRequests = [];
        for (let i = 3; i < TOTAL_BATCHES; i++) {
          const skip = i * BATCH_SIZE;
          remainingRequests.push(
            axios
              .get(`https://leetcode-api-mu.vercel.app/problems?skip=${skip}&limit=100`, { timeout: 15000 })
              .then((res) => res.data?.problemsetQuestionList || [])
              .catch(() => [])
          );
        }

        const remainingResults = await Promise.all(remainingRequests);
        if (!isMounted) return;

        const allCombined = [...accumulated, ...remainingResults.flat()];

        // Deduplicate problems by titleSlug / questionFrontendId
        const seen = new Set();
        const uniqueProblems = [];
        for (const prob of allCombined) {
          if (prob && prob.titleSlug && !seen.has(prob.titleSlug)) {
            seen.add(prob.titleSlug);
            uniqueProblems.push(prob);
          }
        }

        // Sort by ID ascending
        uniqueProblems.sort((a, b) => Number(a.questionFrontendId) - Number(b.questionFrontendId));

        setProblemList(uniqueProblems);
        setLoadingProgress(100);
      } catch (err) {
        console.error("Error fetching problems:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllProblemsInBatches();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute tag list with counts
  const tagCounts = useMemo(() => {
    const counts = {};
    problemList.forEach((prob) => {
      prob.topicTags?.forEach((tag) => {
        if (tag?.name) {
          counts[tag.name] = (counts[tag.name] || 0) + 1;
        }
      });
    });
    return counts;
  }, [problemList]);

  useEffect(() => {
    const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
    setAllTags(sortedTags);
  }, [tagCounts]);

  const handleTagToggle = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setActiveTags([]);
    setSelectedDifficulty("ALL");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Filter problems based on search, difficulty, and concept tags
  const filteredProblems = useMemo(() => {
    return problemList
      .filter((prob) => {
        if (selectedDifficulty !== "ALL") {
          if (prob.difficulty?.toUpperCase() !== selectedDifficulty) {
            return false;
          }
        }
        return true;
      })
      .filter((prob) => {
        if (!debouncedSearchTerm) return true;
        const term = debouncedSearchTerm.toLowerCase().trim();
        const matchesTitle = prob.title?.toLowerCase().includes(term);
        const matchesId = String(prob.questionFrontendId) === term || `#${prob.questionFrontendId}` === term;
        return matchesTitle || matchesId;
      })
      .filter((prob) => {
        if (activeTags.length === 0) return true;
        const tagNames = (prob.topicTags || []).map((t) => t.name);
        return tagFilterMode === "OR"
          ? activeTags.some((tag) => tagNames.includes(tag))
          : activeTags.every((tag) => tagNames.includes(tag));
      });
  }, [problemList, debouncedSearchTerm, activeTags, tagFilterMode, selectedDifficulty]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedDifficulty, activeTags, tagFilterMode]);

  // Pagination calculations
  const totalItems = filteredProblems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentProblems = useMemo(() => {
    return filteredProblems.slice(startIndex, endIndex);
  }, [filteredProblems, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (problemsTopRef.current) {
      problemsTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Filtered list of tags in sidebar search
  const visibleTags = useMemo(() => {
    if (!tagSearchTerm) return allTags;
    return allTags.filter((t) => t.toLowerCase().includes(tagSearchTerm.toLowerCase().trim()));
  }, [allTags, tagSearchTerm]);

  // Generate pagination number range with ellipsis
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let left = Math.max(2, currentPage - 1);
      let right = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        left = 2;
        right = 4;
      } else if (currentPage >= totalPages - 2) {
        left = totalPages - 3;
        right = totalPages - 1;
      }

      if (left > 2) pages.push("...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="dashboard-layout" ref={problemsTopRef}>
      {/* Sidebar: Search, Tag Cloud & Concept Filters */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-section">
          <input
            type="text"
            placeholder="Search problems by name or #ID..."
            className="filter-search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sidebar-section">
          <div className="sidebar-header">
            <h3>Concepts & Topics ({allTags.length})</h3>
            {activeTags.length > 0 && (
              <button onClick={() => setActiveTags([])} className="clear-tag-btn">
                Clear ({activeTags.length})
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Filter concepts..."
            className="tag-search-bar"
            value={tagSearchTerm}
            onChange={(e) => setTagSearchTerm(e.target.value)}
          />

          <div className="tag-cloud">
            {visibleTags.length === 0 ? (
              <div className="no-tags-found">No matching concepts</div>
            ) : (
              visibleTags.map((tag) => {
                const isSelected = activeTags.includes(tag);
                const count = tagCounts[tag] || 0;
                return (
                  <div
                    key={tag}
                    className={`tag-cloud-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    <span>{tag}</span>
                    <span className="tag-count">{count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Main Content: Filters, Problem Grid & Pagination */}
      <main className="dashboard-main">
        {/* Top Control Bar */}
        <div className="dashboard-top-bar">
          {/* Difficulty Filter Tabs */}
          <div className="difficulty-pills">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                className={`difficulty-pill ${diff.toLowerCase()} ${selectedDifficulty === diff ? "active" : ""}`}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff === "ALL" ? "All Difficulties" : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Tag Match Mode (OR / AND) & Page Size Selector */}
          <div className="controls-right">
            <div className="page-size-selector">
              <label htmlFor="pageSizeSelect">Show:</label>
              <select
                id="pageSizeSelect"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={24}>24 / page</option>
                <option value={48}>48 / page</option>
                <option value={96}>96 / page</option>
              </select>
            </div>

            {activeTags.length > 1 && (
              <button
                className="mode-toggle-btn"
                onClick={() => setTagFilterMode((prev) => (prev === "OR" ? "AND" : "OR"))}
                title="Toggle between matching ANY tag (OR) or ALL tags (AND)"
              >
                Match: <strong>{tagFilterMode}</strong>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips & Result Counter */}
        <div className="active-filters-bar">
          <div className="active-filters-left">
            <span className="results-count-text">
              Showing <strong>{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of{" "}
              <strong>{totalItems.toLocaleString()}</strong> problems
              {loadingProgress < 100 && (
                <span className="catalog-loading-badge"> (Loading full catalog: {problemList.length}/2,000)</span>
              )}
            </span>

            {activeTags.map((tag) => (
              <span key={tag} className="filter-tag" onClick={() => handleTagToggle(tag)}>
                {tag} ✕
              </span>
            ))}
          </div>

          {(activeTags.length > 0 || selectedDifficulty !== "ALL" || searchTerm) && (
            <button className="reset-all-btn" onClick={handleClearAllFilters}>
              Reset All Filters
            </button>
          )}
        </div>

        {/* Problem Cards Grid */}
        <div className="problems-grid">
          {loading && problemList.length === 0 ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="problem-card skeleton-card">
                <div className="skeleton-title" />
                <div className="skeleton-tags" />
                <div className="skeleton-difficulty" />
              </div>
            ))
          ) : currentProblems.length === 0 ? (
            <div className="no-problems-container">
              <div className="no-problems-icon">🔍</div>
              <h3>No problems found</h3>
              <p>Try adjusting your search query, difficulty, or active concept filters.</p>
              <button className="reset-filters-btn" onClick={handleClearAllFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            currentProblems.map((prob) => (
              <ProblemCard
                key={prob.titleSlug}
                title={prob.title}
                difficulty={prob.difficulty}
                tags={prob.topicTags || []}
                titleSlug={prob.titleSlug}
                questionFrontendId={prob.questionFrontendId}
              />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </div>

            <div className="pagination-buttons">
              <button
                className="page-btn nav-btn"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                title="First Page"
              >
                «
              </button>
              <button
                className="page-btn nav-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                ‹ Prev
              </button>

              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="pagination-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn num-btn ${currentPage === p ? "active" : ""}`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="page-btn nav-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next Page"
              >
                Next ›
              </button>
              <button
                className="page-btn nav-btn"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                title="Last Page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
