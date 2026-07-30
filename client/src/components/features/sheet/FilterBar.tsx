import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const FilterBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [status, setStatus] = useState(searchParams.get('isSolved') || '');
  const [starred, setStarred] = useState(searchParams.get('isStarred') || '');
  
  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 glass-subtle rounded-xl">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-muted font-medium uppercase tracking-wider">Difficulty</label>
        <select 
          className="input-field py-1.5 px-3 text-sm h-auto"
          value={difficulty} 
          onChange={(e) => {
            setDifficulty(e.target.value);
            updateFilters('difficulty', e.target.value);
          }}
        >
          <option value="">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-muted font-medium uppercase tracking-wider">Platform</label>
        <select 
          className="input-field py-1.5 px-3 text-sm h-auto"
          value={platform} 
          onChange={(e) => {
            setPlatform(e.target.value);
            updateFilters('platform', e.target.value);
          }}
        >
          <option value="">All</option>
          <option value="leetcode">LeetCode</option>
          <option value="geeksforgeeks">GeeksforGeeks</option>
          <option value="codestudio">CodeStudio</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-muted font-medium uppercase tracking-wider">Status</label>
        <select 
          className="input-field py-1.5 px-3 text-sm h-auto"
          value={status} 
          onChange={(e) => {
            setStatus(e.target.value);
            updateFilters('isSolved', e.target.value);
          }}
        >
          <option value="">All</option>
          <option value="true">Solved</option>
          <option value="false">Unsolved</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-muted font-medium uppercase tracking-wider">Starred</label>
        <select 
          className="input-field py-1.5 px-3 text-sm h-auto"
          value={starred} 
          onChange={(e) => {
            setStarred(e.target.value);
            updateFilters('isStarred', e.target.value);
          }}
        >
          <option value="">All</option>
          <option value="true">Starred Only</option>
        </select>
      </div>
    </div>
  );
};
