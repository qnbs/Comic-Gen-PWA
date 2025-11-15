import React from 'react';
import {
  useSettingsPage,
  UseSettingsPageReturn,
} from '../hooks/useSettingsPage';

const SettingsPageContext = React.createContext<
  UseSettingsPageReturn | undefined
>(undefined);

export const useSettingsPageContext = () => {
  const context = React.useContext(SettingsPageContext);
  if (!context) {
    throw new Error(
      'useSettingsPageContext must be used within a SettingsPageProvider',
    );
  }
  return context;
};

export const SettingsPageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const settingsPageLogic = useSettingsPage();
  return (
    <SettingsPageContext.Provider value={settingsPageLogic}>
      {children}
    </SettingsPageContext.Provider>
  );
};
