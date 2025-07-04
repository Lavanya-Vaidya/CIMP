const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Temporary in-memory array to store clubs
let clubs = [];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ROUTES
app.get("/", (req, res) => {
  res.render("dashboard", { clubs });
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/clubs", (req, res) => {
  const query = req.query.q;
  let filteredClubs = clubs;
  if (query) {
    const q = query.toLowerCase();
    filteredClubs = clubs.filter(
      club =>
        club.name.toLowerCase().includes(q) ||
        club.description.toLowerCase().includes(q) ||
        club.category.toLowerCase().includes(q)
    );
  }
  res.render("clubs", { clubs: filteredClubs, q: query});
});  //filter

app.get("/clubs/:id/edit", (req, res) => {
  const club = clubs.find(c => c.id == req.params.id);
  if (club) {
    res.render("editClub", { club });
  } else {
    res.status(404).send("Club not found");
  }
});// edit


app.post("/clubs/:id/edit", (req, res) => {
  const club = clubs.find(c => c.id == req.params.id);
  if (club) {
    club.name = req.body.name;
    club.description = req.body.description;
    club.category = req.body.category;
  }
  res.redirect("/clubs");
});   // update club

app.post("/create", (req, res) => {
  const { name, description, category } = req.body;
   const newClub = {
    id: Date.now(), // generate simple ID
    name,
    description,
    category,
    members:[],
    president: null,
  };
  clubs.push(newClub); // store in array
  res.redirect("/clubs");
});

  app.get("/clubs/:id", (req, res) => {
  const club = clubs.find(c => c.id == req.params.id);
  if (club) {
    res.render("clubDetail", { club });
  } else {
    res.status(404).send("Club not found");
  }
});


app.post("/clubs/:id/add-member", (req, res) => {
  const club = clubs.find(c => c.id == req.params.id);
  const { memberName } = req.body;
  if (club && memberName) {
    club.members.push(memberName);
  }
  res.redirect(`/clubs/${req.params.id}`);
});

// Set president from members
app.post("/clubs/:id/set-president", (req, res) => {
  const club = clubs.find(c => c.id == req.params.id);
  const { president } = req.body;
  if (club && club.members.includes(president)) {
    club.president = president;
  }
  res.redirect(`/clubs/${req.params.id}`);
});


app.delete("/clubs/:id", (req, res) => {
  const idx = clubs.findIndex(c => c.id == req.params.id);
  if (idx !== -1) {
    clubs.splice(idx, 1);
  }
  res.redirect("/clubs");
});

  

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
