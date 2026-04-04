import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('platepulse_user_id');
    if (storedId) {
      fetchUser(storedId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (uid) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${uid}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setUserId(uid);
        setIsOnboardingComplete(true);
      } else {
        localStorage.removeItem('platepulse_user_id');
      }
    } catch {
      // Backend unreachable — keep stored id, treat as complete so app still loads
      const storedId = localStorage.getItem('platepulse_user_id');
      if (storedId) {
        setUserId(storedId);
        setIsOnboardingComplete(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (formData) => {
    try {
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newUser = await response.json();
        localStorage.setItem('platepulse_user_id', newUser.id);
        setUser(newUser);
        setUserId(newUser.id);
        setIsOnboardingComplete(true);
        return { success: true };
      }
      return { success: false, error: 'Server error. Please try again.' };
    } catch {
      return { success: false, error: 'Cannot reach server. Check your connection.' };
    }
  };

  const updateUser = (updated) => setUser(updated);

  return (
    <UserContext.Provider value={{ user, userId, isOnboardingComplete, isLoading, completeOnboarding, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
