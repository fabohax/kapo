'use client';

import { useContext, useState, useEffect } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import { Button } from '@/components/ui/button';
import GetInModal from './GetInModal';
import UserModal from './UserModal';

interface GetInButtonProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

export const GetInButton = (buttonProps: GetInButtonProps) => {
  const { children } = buttonProps;
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGetInModal, setShowGetInModal] = useState(false);
  const [isSessionLoggedIn, setIsSessionLoggedIn] = useState(false);
  
  // Use the context but with error handling
  const hiroWalletContext = useContext(HiroWalletContext);
  const isWalletConnected = hiroWalletContext?.isWalletConnected || false;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkSession = () => {
        try {
          const session = localStorage.getItem('kapu_session');
          setIsSessionLoggedIn(!!session);
        } catch {
          setIsSessionLoggedIn(false);
        }
      };
      checkSession();
      window.addEventListener('storage', checkSession);

      // Also listen for route changes to update session state after navigation
      const handleVisibility = () => checkSession();
      window.addEventListener('visibilitychange', handleVisibility);

      return () => {
        window.removeEventListener('storage', checkSession);
        window.removeEventListener('visibilitychange', handleVisibility);
      };
    }
  }, []);

  // Listen for disconnect to update session state
  useEffect(() => {
    if (!isWalletConnected) {
      const session = localStorage.getItem('kapu_session');
      if (!session) setIsSessionLoggedIn(false);
    }
  }, [isWalletConnected]);

  // Also update session state when modal closes (for immediate UI update after login)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkSession = () => {
        const session = localStorage.getItem('kapu_session');
        setIsSessionLoggedIn(!!session);
      };
      // Listen for custom event after login
      window.addEventListener('kapu-session-update', checkSession);
      return () => window.removeEventListener('kapu-session-update', checkSession);
    }
  }, []);

  if (isSessionLoggedIn) {
    return (
      <div className='fixed top-8 right-8 z-[100]'>
        <button
          type="button"
          className="w-9 h-9 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full p-4 cursor-pointer select-none"
          onClick={() => setShowUserModal(true)}
          aria-label="Profile"
        >
        </button>
        {showUserModal && <UserModal onClose={() => setShowUserModal(false)} />}
      </div>
    );
  }

  // Only show the GetInModal button, remove the connect wallet button
  return (
    <>
      <div className='fixed top-6 right-6 z-[100]'>
        <Button
          onClick={() => setShowGetInModal(true)}
          className="title rounded-full px-6 py-5 text-sm bg-[#E9E9E9] hover:bg-black text-black hover:text-white border-2 border-black hover:border-2 hover:border-white cursor-pointer select-none"
          {...buttonProps}
        >
          {children || 'GET IN'}
        </Button>
      </div>
      {showGetInModal && <GetInModal onClose={() => setShowGetInModal(false)} />}
    </>
  );
};
