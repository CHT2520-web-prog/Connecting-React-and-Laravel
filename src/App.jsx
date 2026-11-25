import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import FilmList from "./components/FilmList";
import FilmDetails from "./components/FilmDetails";
import CreateFilm from "./components/CreateFilm";

const initialFilms = [
  { id: 1, title: "The Incredibles", year: 2004, duration: 115 },
  { id: 2, title: "Spirited Away", year: 2001, duration: 125 },
  { id: 3, title: "Mean Girls", year: 2004, duration: 97 },
  { id: 4, title: "Finding Nemo", year: 2003, duration: 100 },
  { id: 5, title: "The Dark Knight", year: 2008, duration: 152 },
];

function App() {
  const navigate = useNavigate();
  const [films, setFilms] = useState(initialFilms);

  const addFilm = (newFilm) => {
    const filmIds = films.map((film) => film.id);
    console.log(filmIds);
    // ... this turns the array into individual arguments: Math.max(1, 2, 3)
    const highestID = Math.max(0, ...filmIds);
    const filmWithId = { ...newFilm, id: highestID + 1 };
    setFilms([...films, filmWithId]);
    navigate("/");
  };
  const deleteFilm = (deleteId) => {
    const newFilmList = films.filter((film) => film.id !== deleteId);
    setFilms(newFilmList);
    navigate("/");
  };

  return (
    <div>
      <div>
        <Link to="/">home</Link>
        <Link to="/create">create</Link>
      </div>
      <Routes>
        <Route path="/" element={<FilmList films={films} />} />
        <Route
          path="/films/:id"
          element={<FilmDetails films={films} onFilmDelete={deleteFilm} />}
        />
        <Route path="/create" element={<CreateFilm onFilmAdd={addFilm} />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
