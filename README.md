# Connecting React and Laravel

Previously we built an SPA using React. In this practical we will look at connecting this app to a Laravel API back-end.

React will be responsible for the user interface, Laravel will be responsible for the application logic and peristing data, and the two will communicate through an HTTP API using JSON.

## Making a Laravel API

You will need a working version of the Laravel films app.

In Codespaces open this Laravel app.

In the terminal enter:

```
php artisan install:api
```

This will install some libraries, and create some files so the Laravel app can act as an API. Answer 'yes' to running the database migrations.

You might get a message _WARN Unable to automatically add API route definition to [bootstrap/app.php]_.

If you do, open _bootstrap/app.php_ and manually add the api routes file. Find the `withRouting` call and add in `api: __DIR__ . '/../routes/api.php',` i.e.

```php
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
```

Next, make a controller for the API:

```
php artisan make:controller Api/FilmController --api
```

Open this file, _app/Http/Controllers/Api/FilmController.php_ and add the following code:-

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

This is an API version of our original FilmController. Instead of returning HTML via blade files, we return JSON data.

If you look in the _routes_ folder you should find there is new _api.php_ file. This is where we will declare the routes for our API.

At the top of _api.php_ import our new API FilmController.

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

At this point we are all set-up with our API.

## Testing the API

In the terminal enter:

```
php artisan serve
```

Your films app should start, view it in a browser.

Put a route of _api/films_ on the end of the URL

You should see JSON data generated from the database.

Have a look at _api.php_ and the API FilmController `index()` method. Make sure you understand how this is working.

> Note, we don't have to specify 'api' in the route declarations in _api.php_. Laravel automatically maps routes that feature 'api' to the _api.php_ routes file.

Test the 'show' route e.g. _api/films/3_ you should see the details of a single film.

### Testing the Create and Delete Actions

We can't test the create and delete actions simply by entering a URL in a browser. This make a `GET` request, we need to make `POST` and `DELETE` requests, and we need to send data as part of the request.

There are various tools we can use to test an API endpoint. For example, [Postman](https://www.postman.com/).

We will use the REST Client extension in VS Code to test our API.

In your Codespace, select Extensions (It looks like a stack of blocks in the Activity Bar)

Search for REST Client. Select the one published by Huachao Mao and install it.

In the root of the project folder add create a new file call it _films.http_/

Enter the following code:-

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

Save the file

Make sure your Laravel app is running i.e. `php artisan serve`

In _films.http_ file before the `GET http://127.0.0.1:8000/api/films` there should be some text that says 'Send Request'.

Click on this and a new panel should open showing the response from Laravel (a list of films in JSON format)

Click the Create Film 'Send Request' . You should get a response confirming the film has been added

Click the Get All Films 'Send Request' again and confirm that the film has been added. Make a note of the new film's ID value.

Experiment with the 'Get individual film' and 'Delete film' requests. You will probably have to adjust the id value in the URL.

If you look in FilmController you should see that there is some simple user input validation

Check this works, try the Create Film request again but this time remove one of the properties, you should get an error message in the response.

## A React Front-End

In your Codespace, open a new terminal (there is a plus sign on the right-hand side of the terminal panel) and enter the following:

```
git clone https://github.com/CHT2520-web-prog/Connecting-React-and-Laravel
```

Navigate to this folder:

```
cd Connecting-React-and-Laravel/
```

Install the React project's dependencies.

```
npm install
```

Start the React app

```
npm run dev
```

Test the app in a browser. It should be running on port 5173.

This is the same app we worked on previously with a couple of changes

1. We have split the components into their own files and used `import`/`export` to share functions in the app.
2. I have added a certificate dropdown in the `CreateFilm` component. This is to make integration with Laravel easier where the `films` table expects a certificate id foreign key.

- Test the app. make sure you can add and delete films.

Problem with this app is the data is hard-coded and isn't persisted. If we add a film and refresh the page, the data has gone.

We want to connect this app with the Laravel API.

## Configuring CORS

First we need to tell Laravel to accept request from our React app.

> By default, Laravel blocks cross-origin requests for security i.e. our React app is running on port 5173 (a different port to Laravel's), therefore Laravel will block any requests coming from the app.

You should have two terminals open, one for your Laravel app, and one for your React app.

In the Laravel terminal enter:

```
php artisan config:publish cors
```

This simply generates a _cors.php_ file where we can whitelist our React app.

Open _config/cors.php_

Change the allowed_origins setting to accept requests from our React app.

```
    'allowed_origins' => [
        'https://name-of-codespace-5173.app.github.dev',
    ],
```

## Using `fetch` in our React App

In the React app (the Connecting-React-and-Laravel folder), inside the 'src' folder add a new folder, call it 'services'. Inside this folder create a new file called _filmServics.js_.

Paste the following code into _filmService.js_

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

The _filmService.js_ file is a series of functions that make `fetch` requests to our Laravel API.

In _App.jsx_ add the following line at the top of the page to import these functions.

```js
import { getFilms, createFilm, destroyFilm } from "./services/filmService";
```

Comment out the `initialFilms` array.

Change the initialisation in the `App` component to set `films` to be an empty array.

```js
const [films, setFilms] = useState([]);
```

Immediately after this line of code add the following `useEffect` hook.

```js
useEffect(() => {
  const loadFilms = async () => {
    const films = await getFilms();
    setFilms(films);
  };

  loadFilms();
}, []);
```

[useEffect](https://react.dev/reference/react/useEffect) is a React Hook that lets you run code as a side effect of rendering a component. In this case, it tells React that once the component has rendered, run this code.

Test the react app in a browser, the list of films should now be coming from the Laravel API.

### Getting Create to Work

Next, we will get the create film functionality to use the Laravel API.

Change the `addFilm` function to:-

```js
const addFilm = async (newFilm) => {
  await createFilm(newFilm);
  const films = await getFilms();
  setFilms(films);
  navigate("/");
};
```

This calls the `createFilm()` function in _filmService.js_ which makes a `fetch` POST request to add a new film.

The `addFilm` function then calls `getFilms()` again to reload the list of films from the back-end.

> This adopts the approach of the API being the source of truth. Alternatively, we could update the films locally.

Test this works, you should be able to add a new film.

### Getting Delete to Work

Again we need to change the delete Film functionality to use the API. Change `deleteFilm` to the following

```js
const deleteFilm = async (deleteId) => {
  await destroyFilm(deleteId);
  const films = await getFilms();
  setFilms(films);
  navigate("/");
};
```

Like the `addFilm` function this calls a function from the filmService.js (`destroyFilm`) and then requests the list of films again.

Test the app. You find the user can view, create and delete film.

## Adding a Loading Indicator

This works fine but you might find that there is a delay after adding/deleting a film as the React app communicates with the Laravel API.

We can display a message to the user to give them some feedback.

In the `App` component we'll add a new state variable, `loading`, and we'll use this to display a message to the user

Modify the App component to add the `loading` variable and conditionally render a loading message.

```js
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

import { getFilms, createFilm, destroyFilm } from "./services/filmService";

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
    try {
      await createFilm(newFilm);
      const films = await getFilms();
      setFilms(films);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const deleteFilm = async (deleteId) => {
    setLoading(true);
    try {
      await destroyFilm(deleteId);
      const films = await getFilms();
      setFilms(films);
      setLoading(false);
      navigate("/");
    } finally {
      setLoading(false);
    }
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

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
```

Before each call to the API we set `loading` to be true.

We wrap the asynchronous function call in a `try...finally` block. The `finally` block will always execute, setting `loading` to false, even if the request fails.

```js
try {
  await createFilm(newFilm);
  const films = await getFilms();
  setFilms(films);
  navigate("/");
} finally {
  setLoading(false);
}
```

When `loading` is true we display a loading message in the UI.

```js
if (loading) {
  return (
    <div className="page">
      <p>Loading...</p>
    </div>
  );
}
```

## Limitations

This is a fairly rapid overview of connecting a React App to a Laravel back-end. There is plenty of room for improvement and further features to look into.

- The API returns validation error message but we never handle them in the React app.
- The user experience is still 'clunky'. We show loading messages, but it would be much better if we updated the list of films in the background.
- The app is very simple. An obvious next step would be to integrate authentication. Laravel uses [Sanctum](https://laravel.com/framework/docs/sanctum), a library for authenticating requests from SPAs.
