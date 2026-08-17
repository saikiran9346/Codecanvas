import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Calendar.css";
import { BACKEND_URL } from "../components/constants";

// Error Boundary Component
class CalendarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Calendar Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong with the calendar</h2>
          <p>Please refresh the page or try again later.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="retry-button"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">⟳</div>
    <p>Loading contests...</p>
  </div>
);

// Skeleton Loader for contests
const ContestSkeleton = () => (
  <div className="contest-item skeleton-contest">
    <div className="skeleton-title" style={{ width: '60%', height: '1.1rem', marginBottom: 8 }} />
    <div className="skeleton-tags" style={{ width: '40%', height: '0.8rem', marginBottom: 6 }} />
    <div className="skeleton-difficulty" style={{ width: '30%', height: '0.8rem' }} />
  </div>
);

// Helper for local day comparison
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Main Calendar Component
const Calendar = () => {
  const navigate = useNavigate();

  // State management (fresh data on mount)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [contests, setContests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateContests, setSelectedDateContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const jwtoken = localStorage.getItem("jwtoken");
    if (!jwtoken) {
      navigate("/login");
    }
  }, [navigate]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (
      !currentDate ||
      !(currentDate instanceof Date) ||
      isNaN(currentDate.getTime())
    ) {
      setCurrentDate(new Date());
    }
    setInitialized(true);
  }, [currentDate]);

  const fetchCodeforcesContests = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contests/codeforces`);
      if (!response.ok) throw new Error("Codeforces API failed");

      const data = await response.json();
      return Array.isArray(data.contests) ? data.contests : [];
    } catch (error) {
      console.error("Codeforces API error:", error);
      return [];
    }
  }, []);

  const fetchLeetCodeContests = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contests`);
      if (!response.ok) throw new Error("LeetCode API failed");

      const data = await response.json();
      return Array.isArray(data.contests) ? data.contests : [];
    } catch (error) {
      console.error("LeetCode API error:", error);
      return [];
    }
  }, []);

  const fetchCodeChefContests = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contests/codechef`);
      if (!response.ok) throw new Error("CodeChef API failed");

      const data = await response.json();
      return Array.isArray(data.contests) ? data.contests : [];
    } catch (error) {
      console.error("CodeChef API error:", error);
      return [];
    }
  }, []);

  const fetchContestsFromAllPlatforms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        fetchCodeforcesContests(),
        fetchLeetCodeContests(),
        fetchCodeChefContests(),
      ]);

      const allContests = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value)
        .filter((contest) => contest && contest.name && contest.start_time);

      const now = Date.now();
      const validContests = allContests
        .filter((contest) => {
          const startTime = new Date(contest.start_time).getTime();
          const durationMs = (typeof contest.duration === "number" ? contest.duration : 7200) * 1000;
          return !isNaN(startTime) && (startTime + durationMs) >= now;
        })
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      setContests(validContests);
    } catch (error) {
      console.error("Error fetching contests:", error);
      setError("Failed to fetch contests.");
    } finally {
      setLoading(false);
    }
  }, [fetchCodeforcesContests, fetchLeetCodeContests, fetchCodeChefContests]);

  useEffect(() => {
    if (initialized) {
      fetchContestsFromAllPlatforms();
    }
  }, [initialized, fetchContestsFromAllPlatforms]);

  const getDaysInMonth = useCallback((date) => {
    if (!date || !(date instanceof Date)) return 31;
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date) => {
    if (!date || !(date instanceof Date)) return 0;
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  }, []);

  const hasContestOnDate = useCallback(
    (date) => {
      if (!contests || !Array.isArray(contests)) return false;
      return contests.some((contest) => isSameDay(contest.start_time, date));
    },
    [contests]
  );

  const getContestsForDate = useCallback(
    (date) => {
      if (!contests || !Array.isArray(contests)) return [];
      return contests
        .filter((contest) => isSameDay(contest.start_time, date))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    },
    [contests]
  );

  const getContestCountForDate = useCallback(
    (date) => {
      return getContestsForDate(date).length;
    },
    [getContestsForDate]
  );

  const handleDateClick = useCallback(
    (day) => {
      try {
        const clickedDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        );
        setSelectedDate(clickedDate);
        const contestsForDate = getContestsForDate(clickedDate);
        setSelectedDateContests(contestsForDate);
      } catch (error) {
        console.error("Error handling date click:", error);
        setSelectedDateContests([]);
      }
    },
    [currentDate, getContestsForDate]
  );

  const navigateMonth = useCallback((direction) => {
    setCurrentDate((prevDate) => {
      try {
        const newDate = new Date(prevDate);
        const newMonth = newDate.getMonth() + direction;

        if (newMonth > 11) {
          return new Date(newDate.getFullYear() + 1, 0, 1);
        } else if (newMonth < 0) {
          return new Date(newDate.getFullYear() - 1, 11, 1);
        } else {
          return new Date(newDate.getFullYear(), newMonth, 1);
        }
      } catch (error) {
        console.error("Error navigating month:", error);
        return new Date();
      }
    });
    setSelectedDate(null);
    setSelectedDateContests([]);
  }, []);

  const renderCalendarDays = useCallback(() => {
    if (!currentDate || !(currentDate instanceof Date)) {
      return <div>Error: Invalid date</div>;
    }

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const hasContest = hasContestOnDate(date);
      const contestCount = getContestCountForDate(date);
      const isSelected = selectedDate && isSameDay(selectedDate, date);

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasContest ? "has-contest" : ""} ${isSelected ? "selected-day" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {hasContest && (
            <div className="contest-indicator">
              <div className="contest-dot"></div>
              {contestCount > 1 && (
                <div className="contest-count">{contestCount}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  }, [
    currentDate,
    selectedDate,
    getDaysInMonth,
    getFirstDayOfMonth,
    hasContestOnDate,
    getContestCountForDate,
    handleDateClick,
  ]);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  if (
    !currentDate ||
    !(currentDate instanceof Date) ||
    isNaN(currentDate.getTime())
  ) {
    return (
      <div className="error-container">
        <h2>Calendar Error</h2>
        <p>Invalid date detected. Please refresh the page.</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }

  const activeContestsList = selectedDate ? selectedDateContests : contests.slice(0, 10);

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        <div className="calendar-section">
          <div className="calendar-header">
            <div className="navigation">
              <button className="nav-button" onClick={() => navigateMonth(-1)}>
                ‹
              </button>
              <h2 className="month-year">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button className="nav-button" onClick={() => navigateMonth(1)}>
                ›
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="days-header">
              {daysOfWeek.map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
            </div>
            <div className="days-grid">{renderCalendarDays()}</div>
          </div>
        </div>

        <aside className="contests-sidebar">
          <section className="contests-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>
                {selectedDate
                  ? `Contests for ${selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                  : "Upcoming Contests"}
              </h3>
              {selectedDate && (
                <button
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedDateContests([]);
                  }}
                  className="clear-filter-btn"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#a0a0a0',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Show All
                </button>
              )}
            </div>
            <div className="contests-list">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => <ContestSkeleton key={idx} />)
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : activeContestsList.length === 0 ? (
                <div className="no-contests">
                  {selectedDate ? "No contests scheduled for this date." : "No upcoming contests found."}
                </div>
              ) : (
                activeContestsList.map((contest, idx) => (
                  <div key={idx} className="contest-item">
                    <h4>
                      <span className={`platform-badge platform-${contest.site?.toLowerCase() || 'other'}`}>
                        {contest.site}
                      </span>
                      {contest.name}
                    </h4>
                    <p>
                      <span className="label">Start:</span>{" "}
                      {new Date(contest.start_time).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p>
                      <span className="label">Duration:</span>{" "}
                      {typeof contest.duration === "number"
                        ? `${Math.floor(contest.duration / 3600)}h ${Math.floor((contest.duration % 3600) / 60)}m`
                        : contest.duration}
                    </p>
                    {contest.url && (
                      <a
                        href={contest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contest-link"
                      >
                        View Contest
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

// CalendarWithErrorBoundary wrapper
const CalendarWithErrorBoundary = () => (
  <CalendarErrorBoundary>
    <Calendar />
  </CalendarErrorBoundary>
);

export default CalendarWithErrorBoundary;