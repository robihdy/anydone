import Cookies from 'universal-cookie';

export const cookies = new Cookies();

export const setOptions = {
  maxAge: 1 * 60 * 60,
  path: '/',
};

export const removeOptions = {
  path: '/',
};
