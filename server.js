// Import dependencies
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

// Initialize express and middleware
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

// Setup view engine for EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Connect to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Check connection
db.connect((err) => {
    if (err) {
        console.log("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL as id:", db.threadId);
});



// Root endpoint that loads data for patients and providers
app.get('/', (req, res) => {
    
    // Question 1 Retrieve all patients 
    const patientsQuery = 'SELECT patient_id, first_name, last_name, date_of_birth FROM patients';

   //Question 2: Retrieve all providers
    const providersQuery = 'SELECT first_name, last_name, provider_specialty FROM providers';

    // Fetch patients and providers
    db.query(patientsQuery, (err, patientsResults) => {
        if (err) {
            console.error('Error retrieving patients:', err);
            res.status(500).send('Error retrieving patients');
        } else {
            db.query(providersQuery, (err, providersResults) => {
                if (err) {
                    console.error('Error retrieving providers:', err);
                    res.status(500).send('Error retrieving providers');
                } else {
                    res.render('index', {
                        patients: patientsResults,
                        providers: providersResults,
                        filteredPatients: [],
                        filteredProviders: []
                    });
                }
            });
        }
    });
});


// Question 3:Filter patients by First Name

app.get('/filter-patients', (req, res) => {
    const firstName = req.query.first_name || '';
    const patientsQuery = 'SELECT * FROM patients WHERE first_name LIKE ?';
    const providersQuery = 'SELECT first_name, last_name, provider_specialty FROM providers';

    db.query(patientsQuery, [`%${firstName}%`], (err, filteredPatientsResults) => {
        if (err) {
            console.error('Error filtering patients by first name:', err);
            res.status(500).send('Error filtering patients');
        } else {
            db.query(providersQuery, (err, providersResults) => {
                if (err) {
                    console.error('Error retrieving providers:', err);
                    res.status(500).send('Error retrieving providers');
                } else {
                    res.render('index', {
                        patients: filteredPatientsResults,
                        providers: providersResults,
                        filteredPatients: filteredPatientsResults,
                        filteredProviders: []
                    });
                }
            });
        }
    });
});


// Question 4:Retrieve all providers by their specialty

app.get('/filter-providers', (req, res) => {
    const specialty = req.query.specialty || '';
    const patientsQuery = 'SELECT patient_id, first_name, last_name, date_of_birth FROM patients';
    const providersQuery = 'SELECT * FROM providers WHERE provider_specialty LIKE ?';

    db.query(providersQuery, [`%${specialty}%`], (err, filteredProvidersResults) => {
        if (err) {
            console.error('Error filtering providers by specialty:', err);
            res.status(500).send('Error filtering providers');
        } else {
            db.query(patientsQuery, (err, patientsResults) => {
                if (err) {
                    console.error('Error retrieving patients:', err);
                    res.status(500).send('Error retrieving patients');
                } else {
                    res.render('index', {
                        patients: patientsResults,
                        providers: filteredProvidersResults,
                        filteredPatients: [],
                        filteredProviders: filteredProvidersResults
                    });
                }
            });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
