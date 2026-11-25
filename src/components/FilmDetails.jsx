import { useParams } from "react-router-dom";

const FilmDetails = ({ films, onFilmDelete }) => {
  const id = Number(useParams().id);
  const film = films.find((film) => film.id === id);

  if (film === undefined) {
    return <p>Film not found.</p>;
  }

  return (
    <div className="page">
      <h2>{film.title}</h2>
      <div>
        {film.title} was released in {film.year}. It is {film.duration} minutes
        in length.
      </div>
      <button
        onClick={() => {
          onFilmDelete(film.id);
        }}
      >
        Delete
      </button>
    </div>
  );
};

export default FilmDetails;
