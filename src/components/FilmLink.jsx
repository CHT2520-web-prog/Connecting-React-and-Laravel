import { Link } from "react-router-dom";

const FilmLink = ({ film }) => {
  return <Link to={`/films/${film.id}`}>{film.title}</Link>;
};

export default FilmLink;
