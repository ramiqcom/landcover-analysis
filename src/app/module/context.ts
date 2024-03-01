import { createContext } from 'react';
import { GlobalContext } from './type';
export const Context = createContext<GlobalContext | {}>({});
