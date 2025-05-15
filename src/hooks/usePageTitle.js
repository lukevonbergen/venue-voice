import { useEffect } from 'react';

const usePageTitle = (pageName) => {
  useEffect(() => {
    document.title = `${pageName} – Chatters`;
  }, [pageName]);
};

export default usePageTitle;
