
const express = require ("express");
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine","ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const fs = require('fs');


const bodyParser = require('body-parser');
const { exec } = require('child_process');


const PORT = process.env.PORT ||9090;
// Serve static files (like HTML and CSS)
app.use(express.static('public'));







app.get('/', (req, res) => {

  const filePath = path.join(__dirname, 'views', 'store.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading file' });
      }

      let donors = JSON.parse(data);
      donors.reverse();
console.log(donors)
      res.render('index', { donors: donors }); 
  });
});




app.get('/', async (req, res) => {
  const filePath = path.join(__dirname, 'views', 'store.json');

  try {
    const data = await fs.readFile(filePath, 'utf8'); // Read file with utf8 encoding
    let donors = JSON.parse(data); // Parse JSON data
    donors.reverse(); // Reverse the array

    // Pass data to EJS
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
    res.status(500).json({ error: 'Error reading file' }); // Handle errors
  }
})

app.post('/save-donor', (req, res) => {
  const donorData = req.body;
  
  // Add the current date and time as registrationDate
  donorData.registration = new Date().toISOString();

  const filePath = path.join(__dirname, 'views', 'store.json');

  // Read existing data
  fs.readFile(filePath, 'utf8', (err, data) => {
      let donors = [];

      if (!err) {
          donors = JSON.parse(data);
      }

      // Add new donor data
      donors.push(donorData);

      // Write updated data
      fs.writeFile(filePath, JSON.stringify(donors, null, 2), (err) => {
          if (err) {
              console.error('Error writing file:', err);
              res.status(500).json({ error: 'Failed to save data' });
          } else {
              res.json({ success: true });
          }
      });
  });
});

app.get('/search-blood', (req, res) => {
  const { division, district, upazila, fetchAll, bloodGroup } = req.query;

  const filePath = path.join(__dirname, 'views', 'store.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading file' });
      }

      let donors = JSON.parse(data);
      donors.reverse();

      if (fetchAll === 'true') {
          // No sorting, just return all data
      } else {
          // Filter based on query parameters
          donors = donors.filter(donor =>
              (division ? donor.division === division : true) &&
              (district ? donor.district === district : true) &&
              (upazila ? donor.upazila === upazila : true) &&
              (bloodGroup ? donor['blood-group'] === bloodGroup : true) // Use bracket notation here
          );
      }

      res.json(donors);
  });
});




app.get('/doubts', (req, res) => {

        res.render('hsc'); 
  });
  


  app.get('/hsc/:group', (req, res) => {
    const group = req.params.group;
    console.log(group)
    res.render('hsc',{group}); 
});

app.get('/hsc/:group/lecture', (req, res) => {
    const group = req.params.group;
    const subject = req.query.subject;
    const chapter = req.query.chapter;
    const teacher = req.query.teacher;

    const filePath = path.join(__dirname, 'public', 'data', `hsc-${group}.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            return res.status(500).send('Error reading the data');
        }

        const jsonData = JSON.parse(data);
        let filteredData = jsonData;

        if (subject) {
            filteredData = filteredData[subject] || {};
        }
console.log(filteredData)
        res.render('lecture', { group, subject,chapter,teacher, data: filteredData });
    });
});



app.get('/blood-registration', (req, res) => {

  const filePath = path.join(__dirname, 'views', 'store.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading file' });
      }

      let donors = JSON.parse(data);
      donors.reverse();
console.log(donors)
      res.render('registration', { donors: donors }); 
  });
});




// Webhook route for handling GitHub events
app.post('/web-hooks', (req, res) => {
    const event = req.headers['x-github-event'];
    console.log(`Received event: ${event}`);
  
    if (event === 'push') {
        // Modify the command to stash changes before pulling
        exec('cd /home/openclass && git stash && git pull && npm install && pm2 restart openclass', (err, stdout, stderr) => {
            if (err) {
                console.error(`Exec error: ${err.message}`);
                return res.status(500).send('Server Error');
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).send('Server Error');
            }
            console.log(`Stdout: ${stdout}`);
            res.status(200).send('Update successful');
        });
    } else {
        console.log(`Unsupported event: ${event}`);
        res.status(400).send('Event not supported');
    }
  });
  
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
