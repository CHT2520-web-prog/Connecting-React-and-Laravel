import FilmLink from "./FilmLink";

const FilmList = ({ films }) => {
  return (
    <div className="page">
      <h2>Film List</h2>
      {films.map((film) => {
        return <FilmLink key={film.id} film={film} />;
      })}
    </div>
  );
};

export default FilmList;
