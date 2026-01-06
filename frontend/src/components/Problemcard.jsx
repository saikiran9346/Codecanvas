import React from "react";
import { Link } from "react-router-dom";
import "./Problemcard.css";

const ProblemCard = ({
  title,
  difficulty,
  tags,
  titleSlug,
  questionFrontendId
}) => {
  const difficultyLower = difficulty.toLowerCase();

  return (
    <Link to={`/problem/${titleSlug}`} className="problem-card-link">
      <div className="problem-card">
        <div className="header">
          <span className={`difficulty ${difficultyLower}`}>{difficulty}</span>
          <h3>#{questionFrontendId} {title}</h3>
        </div>
        <div className="tags">
          {tags.slice(0, 4).map((tag) => (
            <span key={tag.slug}>{tag.name}</span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;
