import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import User from '../services/user-services';
import Auth from '../services/auth-services';
import { TOKEN_KEY, ID } from '../config';
import { useShow } from './ShowContext';

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const { handleShow } = useShow();

  const role = user ? user.role : '';

  const userID = sessionStorage.getItem(ID);

  useEffect(() => {
    const user = setTimeout(() => {
      User.getUser(userID)
        .then((u) => setUser(u))
        .catch(console.log);
    }, 500);
    return () => clearTimeout(user);
  }, []);

  function login(credentials) {
    Auth.login(credentials)
      .then((u) => {
        setUser(u);
      })
      .catch(console.log(error));
  }

  function logout() {
    Auth.logout()
      .then(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(ID);
        setUser(null);
      })
      .catch(console.log);
  }

  function signUp(userData) {
    User.createUser(userData)
      .then((u) => setUser(u))
      .catch(console.log);
  }

  function upDate(id, userData) {
    User.upDateUser(id, userData)
      .then((u) => setUser(u))
      .catch(console.log);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        login,
        logout,
        signUp,
        upDate,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  return useContext(UserContext);
}

export { useUser, UserProvider };
