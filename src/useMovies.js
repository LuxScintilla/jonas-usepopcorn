import { useState, useEffect } from "react";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZDg2YjlmMDA3MDkyZjI2NDc0Y2E1YzMxNDQxOTU0OCIsIm5iZiI6MTcwNzQ3MjgzNi45NDcsInN1YiI6IjY1YzVmN2M0YmQ1ODhiMDE2MzQ1MzExNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XW4Y0PBfPsjDl3Y4GUjHnMgO99HMqq5U7RxKtjxhHUw",
  },
};

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true);
          const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`,
            { ...options, signal: controller.signal }
          );

          if (!response.ok) {
            throw new Error("Sorry, something went wrong with fetching movies");
          }

          const data = await response.json();

          if (data.results.length === 0) {
            throw new Error("Sorry, no movie was found");
          }

          setMovies(data.results);
          setError("");
        } catch (error) {
          if (error.name !== "AbortError") {
            setError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
