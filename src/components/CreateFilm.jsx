const CreateFilm = ({ onFilmAdd }) => {
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const newFilm = {
      title: formData.get("title"),
      year: Number(formData.get("year")),
      duration: Number(formData.get("duration")),
      certificate: Number(formData.get("certificate")),
    };
    onFilmAdd(newFilm);
    event.target.reset();
  };

  return (
    <div className="page">
      <h2>Add a new film</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" name="title" />
        </div>
        <div>
          <label htmlFor="year">Year:</label>
          <input type="number" id="year" name="year" />
        </div>
        <div>
          <label htmlFor="duration">Duration:</label>
          <input type="number" id="duration" name="duration" />
        </div>
        <div>
          <label htmlFor="certificate">Certificate:</label>
          <select id="certificate" name="certificate">
            <option value="1">U</option>
            <option value="1">PG</option>
            <option value="2">12</option>
            <option value="3">15</option>
            <option value="4">18</option>
          </select>
        </div>
        <div>
          <button type="submit">SAVE THE FILM</button>
        </div>
      </form>
    </div>
  );
};

export default CreateFilm;
