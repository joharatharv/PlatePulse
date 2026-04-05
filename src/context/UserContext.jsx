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
  const [registeredUsers, setRegisteredUsers] = useState(
    () => JSON.parse(localStorage.getItem('platepulse_users') || '[]')
  );

  const saveToRegistry = (userData) => {
    setRegisteredUsers(prev => {
      const without = prev.filter(u => u.id !== userData.id);
      const updated = [...without, userData];
      localStorage.setItem('platepulse_users', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const storedId = localStorage.getItem('platepulse_user_id');
    if (storedId) {
      fetchUser(storedId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (uid) => {
    // Sample users are stored entirely in localStorage — no API call needed
    if (uid.startsWith('sample_')) {
      try {
        const stored = localStorage.getItem('platepulse_user_data');
        if (stored) {
          setUser(JSON.parse(stored));
          setUserId(uid);
          setIsOnboardingComplete(true);
          setIsLoading(false);
          return;
        }
      } catch { /* fall through */ }
      localStorage.removeItem('platepulse_user_id');
      setIsLoading(false);
      return;
    }

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
      // Backend unreachable — keep stored id so app still loads
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
        saveToRegistry(newUser);
        return { success: true };
      }
      return { success: false, error: 'Server error. Please try again.' };
    } catch {
      return { success: false, error: 'Cannot reach server. Check your connection.' };
    }
  };

  // Load a sample/demo user entirely from JS — no backend required
  const loadSampleUser = (sampleUser) => {
    const id = sampleUser.id;
    localStorage.setItem('platepulse_user_id', id);
    localStorage.setItem('platepulse_user_data', JSON.stringify(sampleUser));
    setUser(sampleUser);
    setUserId(id);
    setIsOnboardingComplete(true);
    saveToRegistry(sampleUser);
  };

  const loginAsUser = (userData) => {
    localStorage.setItem('platepulse_user_id', userData.id);
    if (userData.id.startsWith('sample_')) {
      localStorage.setItem('platepulse_user_data', JSON.stringify(userData));
    }
    setUser(userData);
    setUserId(userData.id);
    setIsOnboardingComplete(true);
  };

  const logout = () => {
    localStorage.removeItem('platepulse_user_id');
    setUser(null);
    setUserId(null);
    setIsOnboardingComplete(false);
  };

  const updateUser = (updated) => setUser(updated);

  return (
    <UserContext.Provider value={{
      user, userId, isOnboardingComplete, isLoading,
      registeredUsers, completeOnboarding, loadSampleUser,
      loginAsUser, logout, updateUser,
    }}>
      {children}
    </UserContext.Provider>
  );
};
