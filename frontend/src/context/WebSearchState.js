import WebSearchContext from './webSearchContext';
import { useState } from "react";
import { apiRequest } from "../utils/api";

const WebSearchState = (props) => {
  const [webSearches, setWebSearches] = useState([]);

  // Get all Web Searches
  const getWebSearches = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const data = await apiRequest("/web_fetch", "GET", null, token);
    setWebSearches(data);
  };

  // Add a web search
  const addWebSearch = async (title, content, reference_link) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const newWebSearch = await apiRequest("/web_add", "POST", {
      title,
      content,
      reference_link
    }, token);
    setWebSearches((prev) => [...prev, newWebSearch]);
  };

  // Delete a web search
  const deleteWebSearch = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    await apiRequest(`/web_delete/${id}`, "DELETE", null, token);
    setWebSearches((prev) => prev.filter((webSearch) => webSearch._id !== id));
  };

  // Edit a web search
  const editWebSearch = async (id, title, content, reference_link) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    await apiRequest(`/web_update/${id}`, "PUT", {
      title,
      content,
      reference_link
    }, token);

    // Update local state
    setWebSearches((prev) =>
      prev.map((webSearch) =>
        webSearch._id === id
          ? { ...webSearch, title, content, reference_link }
          : webSearch
      )
    );
  };

  return (
    <WebSearchContext.Provider
      value={{
        webSearches,
        setWebSearches,
        getWebSearches,
        addWebSearch,
        deleteWebSearch,
        editWebSearch
      }}
    >
      {props.children}
    </WebSearchContext.Provider>
  );
};

export default WebSearchState;