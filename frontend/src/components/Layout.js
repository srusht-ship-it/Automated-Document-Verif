import React, { useState, useEffect } from 'react';
import SidebarNavigation from './SidebarNavigation';
import HeaderBar from './HeaderBar';
import Footer from './Footer';
import '../styles/Layout.css';

const Layout = ({ children, title, subtitle, showSidebar = true, showHeader = true, showFooter = true }) => {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('doc_verify_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="app-layout">
      {showSidebar && user && (
        <SidebarNavigation 
          userRole={user.role}
          collapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
      )}
      
      <div className={`main-content ${showSidebar && user ? 'with-sidebar' : 'full-width'} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {showHeader && (
          <HeaderBar 
            title={title} 
            subtitle={subtitle}
          />
        )}
        
        <main className={`content-area ${showHeader ? 'with-header' : ''} ${showFooter ? 'with-footer' : ''}`}>
          <div className="content-wrapper">
            {children}
          </div>
        </main>
        
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default Layout;