import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZDg2YjlmMDA3MDkyZjI2NDc0Y2E1YzMxNDQxOTU0OCIsIm5iZiI6MTcwNzQ3MjgzNi45NDcsInN1YiI6IjY1YzVmN2M0YmQ1ODhiMDE2MzQ1MzExNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XW4Y0PBfPsjDl3Y4GUjHnMgO99HMqq5U7RxKtjxhHUw",
  },
};

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  function handleSelectedMovie(id) {
    setSelectedID((selectedID) => (id === selectedID ? null : id));
  }

  function handleCloseMovie() {
    setSelectedID(null);
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true);
          const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`,
            options
          );

          if (!response.ok) {
            throw new Error("Sorry, something went wrong with fetching movies");
          }

          const data = await response.json();

          if (data.results.length === 0) {
            throw new Error("Sorry, no movie was found");
          }

          setMovies(data.results);
          console.log(data.results);
        } catch (error) {
          setError(error.message);
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
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              handleSelectedMovie={handleSelectedMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              handleCloseMovie={handleCloseMovie}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.id}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectedMovie }) {
  return (
    <li onClick={() => handleSelectedMovie(movie.id)}>
      <img
        src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
        alt={`${movie.title} poster`}
      />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.release_date}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedID, handleCloseMovie }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${selectedID}?language=en-US`,
          options
        );
        const data = await response.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedID]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              x
            </button>
            <img
              src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
              alt={`${movie.title} poster`}
            ></img>
            <div className="details-overview">
              <h2>{movie.title}</h2>
              <p>
                {movie.release_date} &bull; {`${movie.runtime} minutes`}
              </p>
              <p>{movie.genres?.map((genre) => `${genre.name} `)}</p>
              <p>
                <span>⭐</span>
                {movie.vote_average}
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating maxRating={10} size={24} />
            </div>
            <p>
              <em>{movie.overview}</em>
            </p>
            <p>Produced by {movie.production_companies?.at(0)?.name}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
