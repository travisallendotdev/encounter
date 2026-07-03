const KEY = 'dicefight.username'

export const getUsername = () => localStorage.getItem(KEY)
export const setUsername = (u: string) => localStorage.setItem(KEY, u)
export const clearUsername = () => localStorage.removeItem(KEY)
