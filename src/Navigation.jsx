import React from 'react';
import './Navigation.css';

export default function Navigation({ currentPage, onNavigate }) {
  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <h1 className="nav-title">Resource Management</h1>
        <ul className="nav-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'human-resources' ? 'active' : ''}`}
              onClick={() => onNavigate('human-resources')}
            >
              Human Resources
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'skills' ? 'active' : ''}`}
              onClick={() => onNavigate('skills')}
            >
              Skills
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'resource-skills' ? 'active' : ''}`}
              onClick={() => onNavigate('resource-skills')}
            >
              Assign Skills
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'companies' ? 'active' : ''}`}
              onClick={() => onNavigate('companies')}
            >
              Companies
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'work-history' ? 'active' : ''}`}
              onClick={() => onNavigate('work-history')}
            >
              Work History
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
