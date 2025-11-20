import React, { useState } from 'react';
import Navigation from './Navigation';
import HumanResourcesList from './HumanResourcesList';
import SkillsList from './SkillsList';
import ResourceSkillsManager from './ResourceSkillsManager';
import CompaniesList from './CompaniesList';
import WorkHistoryManager from './WorkHistoryManager';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('human-resources');
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  const handleNavigateWithResource = (page, resourceId) => {
    setSelectedResourceId(resourceId);
    setCurrentPage(page);
  };

  const handleNavigate = (page) => {
    setSelectedResourceId(null);
    setCurrentPage(page);
  };

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="main-content">
        {currentPage === 'human-resources' && (
          <HumanResourcesList
            onViewSkills={(resourceId) => handleNavigateWithResource('resource-skills', resourceId)}
            onViewWorkHistory={(resourceId) =>
              handleNavigateWithResource('work-history', resourceId)
            }
          />
        )}
        {currentPage === 'skills' && <SkillsList />}
        {currentPage === 'resource-skills' && (
          <ResourceSkillsManager preSelectedResourceId={selectedResourceId} />
        )}
        {currentPage === 'companies' && <CompaniesList />}
        {currentPage === 'work-history' && (
          <WorkHistoryManager preSelectedResourceId={selectedResourceId} />
        )}
      </main>
    </div>
  );
}
