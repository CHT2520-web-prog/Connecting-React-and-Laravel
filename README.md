# Connecting React and Laravel

Previously we built an SPA using React. In this practical we will look connecting this app to a Laravel API back-end.

## Making a Laravel API

In Codespaces open your Laravel films app

In the terminal enter:

```
php artisan install:api
```

This will install some libraries, and create some files so that the Laravel app can act as an API.

- Answer 'yes' to running the database migrations.

If you get a message _WARN Unable to automatically add API route definition to [bootstrap/app.php]_, open _bootstrap/app.php_ and manually add the api routes file. Find the `withRouting` call and add in `api: __DIR__ . '/../routes/api.php',` i.e.

```php
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
```

Make the api controller:-

```
php artisan make:controller Api/FilmController --api
```

Open app/Http/Controllers/Api/FilmController.php and add the following code:-

```php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Film;

class FilmController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $films = Film::all();

        return response()->json($films);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'year' => 'required|integer',
            'duration' => 'required|integer',
            'certificate' => 'required'
        ]);
        $film = new Film();
        $film->title = $request->title;
        $film->year = $request->year;
        $film->duration = $request->duration;
        $film->certificate_id = $request->certificate;
        $film->save();
        return response()->json($film, 201);
    }
    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $film = Film::find($id);

        if (!$film) {
            return response()->json([
                'message' => 'Film not found'
            ], 404);
        }

        return response()->json($film);
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $film = Film::find($id);
        if (!$film) {
            return response()->json([
                'message' => 'Film not found'
            ], 404);
        }
        $film->delete();
        return response()->noContent();
    }
}
```

This is an API version of our original FilmController. It returns JSON responses, not HTML via blade files.

If you look in the _routes_ folder you should find there is new _api.php_ file. This is where we will declare the routes for our API.

At the top import our API `FilmController`.

```php
use App\Http\Controllers\Api\FilmController;
```

Then add the following API routes at the end of this file:

```php
// Film routes
Route::get('/films', [FilmController::class, 'index']);
Route::post('/films', [FilmController::class, 'store']);
Route::get('/films/{id}', [FilmController::class, 'show']);
Route::delete('/films/{id}', [FilmController::class, 'destroy']);
```

## Test the API

In the terminal enter:

```
php artisan serve
```

Your films app should start, view it in a browser.

Put a route of api/films on the end of the URL

You should see json data generated from the database.

Have a look at _api.php_ and the API FilmController index() method. Make sure you understand how this is working.

> Note we don't have to specify 'api' in in the routes in _api.php_. Laravel automatically maps routes that feature 'api' to the _api.php_ routes file.

Test the 'show' route e.g. _api/films/3_ you should see the details of a single film.

## Testing the create and delete actions

How can we do this we need to post some data to the server. to do this we can use a vs code extension

click on extensions the blocks

search for REST Client
Huachao Mao

install the extension

In the root of the project folder add create a new file call it films.http

enter the following code:-

```
### Get all films
GET http://127.0.0.1:8000/api/films

###

### Create film
POST http://127.0.0.1:8000/api/films
Content-Type: application/json
Accept: application/json

{
    "title": "Jaws",
    "year": 1975,
    "duration": 124,
    "certificate":4
}

###

### Get individual film
GET http://127.0.0.1:8000/api/films/16



###

### Delete film
DELETE http://127.0.0.1:8000/api/films/16
Accept: application/json
```

save the file

make sure your laravel is running i.e. php artisan serve

In this file before the `GET http://127.0.0.1:8000/api/films` there should be some text that says 'Send Request'

Click on this and a new panel should open showing the response from Laravel (a list of films in JSON format)

Click the Create Film 'Send Request' . You should get a response confirming the film has been added

Click the Get All Film 'Send Request' and confirm that the film has been added. Make a note of the new film's ID value.

Experiment with the 'Get individual film' and 'Delete film' requests. You will probably have to adjust the id value in the URL.

If you look in the api filmcontroller you should see that there is some simple user input validation

Check this works, try the Create Film request again but this time remove one of the properties, you should get an error message in the response.

## React

Open a new terminal

```
git clone https://github.com/CHT2520-web-prog/Connecting-React-and-Laravel
```

```
cd Connecting-React-and-Laravel/
```

```
npm install
```

```
npm run dev
```

Test in a browser

This is the same app we worked on previously with a couple of changes

1. have split the components into their own files and used import/export.
2. I have added a certificate dropdown in the createfilm component. This is to make integration with Laravel easier.

Problme is the data is hard-coded.
We want to externalise
Add a film and refresh the page, the data has gone

We want to link with the laravel back-end

In the terminal enter:

```
php artisan config:publish cors
```

Open _config/cors.php_

Eventually we will

```
    'allowed_origins' => [
        'https://name-of-codespace-5173.app.github.dev',
    ],
```

Inside the src folder add a new folder, call it 'services'. Inside this folder create a new file called filmServics.js

Paste the following code into filmSservice

```js
const API_URL = "https://name-of-your-codespace-8000.app.github.dev/api/films";

export async function getFilms() {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) {
    throw new Error("Unable to fetch films");
  }
  return await response.json();
}

export async function createFilm(film) {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(film),
  });
  if (!response.ok) {
    throw new Error("Unable to create film");
  }
  return await response.json();
}

export async function destroyFilm(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to delete film");
  }
}
```

In App.jsx add the following line at the top of the paghe to import

```js
import { getFilms, createFilm, destroyFilm } from "./services/filmService";
```

Comment out the films array

Changhe the initialisation to set films to be an empty array.

```js
const [films, setFilms] = useState([]);
```

Immediately after this line of code inside the App component add the following useEffect hook.

```js
useEffect(() => {
  const loadFilms = async () => {
    const films = await getFilms();
    setFilms(films);
  };

  loadFilms();
}, []);
```

useEffect is a React Hook that lets you run code as a side effect of rendering a component.

In simple terms, it lets you tell React:
Once the component has rendered, run this code.

Test the react app in a browser, the list of films should now be coming from the Laravel API.

Next we need to get the add film functionality to use the laravel back-end

Change the addFilm function to:-

```js
const addFilm = async (newFilm) => {
  await createFilm(newFilm);
  const films = await getFilms();
  setFilms(films);
  navigate("/");
};
```

This calls the createFilm() function in filmService.js
This makes a fetch POST request to the API to add a new film.
We then need to reload the list of films from the back-end

> We could update the films locally, but we can easiliy run into the back-end and front-end running out of sync.

Test this works, you should be able to add a new film
Check in the react app and in adminer

### getting delete to work

Again we need to change the delete Film functionality to use the API. Change deleteFilm to the following

```js
const deleteFilm = async (deleteId) => {
  await destroyFilm(deleteId);
  const films = await getFilms();
  setFilms(films);
  navigate("/");
};
```

Like the addFilm function this now calls a function form the filmservuice (destroyFilm)

Have a look at destroy film, see how it makes a delete request to the API

Test the app

##

This works fine but you might find that there is a delay after adding/deleting a film as the react app communicate with the Laravel back end.

We can

In the App component add a new state variable:

We'll use this to display a message to the user

```js
const [loading, setLoading] = useState(true);
```

Modify the App componenent to conditionally render a loading message

```js
function App() {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilms = async () => {
      const films = await getFilms();
      setFilms(films);
      setLoading(false);
    };

    loadFilms();
  }, []);

  const addFilm = async (newFilm) => {
    setLoading(true);
    await createFilm(newFilm);
    const films = await getFilms();
    setFilms(films);
    setLoading(false);
    navigate("/");
  };

  const deleteFilm = async (deleteId) => {
    setLoading(true);
    await destroyFilm(deleteId);
    const films = await getFilms();
    setFilms(films);
    setLoading(false);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

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
```

The basic pattern is before each call to the API we set loading to be true
Once we have the response form the API we set loading to be false
We then display a loading message is loading is true

```
if (loading) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }
```

## Limitations

The API returns validation error message but we neve rhandle them in the Recat app
Authentication using Sanctum
