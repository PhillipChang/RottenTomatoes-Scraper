var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping tools
var axios = require("axios");
var cheerio = require ("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize express
var app = express();

// Morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/rottenTomatoes", { useNewUrlParser: true });


// Routes

// A GET route for scraping the Rotten Tomatoes website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  var scrapeURL = "https://www.rottentomatoes.com/browse/dvd-streaming-all?";
  scrapeURL += "minTomato=0&maxTomato=100&services=amazon;hbo_go;itunes;netflix_iw;vudu;amazon_prime;";
  scrapeURL += "fandango_now&genres=1;2;4;5;6;8;9;10;11;13;18;14&sortBy=release";
  axios.get(scrapeURL).then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".mb-movie").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h3")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Movie.create(result)
        .then(function(dbMovie) {
          // View the added result in the console
          console.log(dbMovie);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    res.send("Scrape Complete");
    });
  });




// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});