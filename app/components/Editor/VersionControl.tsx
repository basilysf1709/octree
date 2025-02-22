'use client'

import React from 'react';
import { GitCommit } from 'lucide-react';

export const VersionControl: React.FC = () => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4">Version History</h2>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <GitCommit className="mt-1 text-gray-400" size={18} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Updated document structure</span>
              <span className="text-sm text-gray-500">v1.2</span>
            </div>
            <p className="text-sm text-gray-500">John Doe • 2h ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 