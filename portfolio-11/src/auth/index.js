export const signup = async user => {
  try {
    const response = await fetch(`${window.process.env.API_RUL}/user/register`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export const login = async user => {
  try {
    const response = await fetch(`${window.process.env.API_RUL}/user/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export const logout = async (next) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    next();
    try {
      const response = await fetch(`${window.process.env.API_RUL}/user/logout`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  } 
}

export const authenticate = (data, next) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(data));
    next();
  }
}
export const isAuthenticated = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('user')) {
    return localStorage.getItem('user') 
  }
  return false;
}