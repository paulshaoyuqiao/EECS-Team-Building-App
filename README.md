# EECS Team Building App

## Setting Up

### Frontend
1. `yarn` is the recommended js package manager for this project. After installing `yarn` on your machine, follow the steps below.
2. In your terminal, enter `yarn` to install all necessary dependencies addressed in `package.json`
3. If there is any new react or js library you want to add, just enter `yarn add <package name>`
4. To start running the frontend of the application, enter `yarn start`, and this should launch a new window in your browser at the address `http://localhost:8887`

### Backend
1. We use `flask` for managing the server-side processing of the application. Currently the master web service is configured to run on `http://127.0.0.1:5000`. However, you can modify the main method inside `server/app.py` to start the service on a different host / port.
2. To start the service, simply run the `server/app.py`.
3. Please note that when you modified the host and port on the server side, you need also update the base url configuration in `src/api/api.js` so that any incoming requests from the React side are hitting the correct endpoints.

### Data Storage
1. We use MongoDB for data storage. The database for this project comprises of a series of collections off 2 different databases (`dev`, and `prod`) of a Mongo Atlas Cluster. It is important to note that to avoid excessive setup networking calls through the Pymongo client, a wrapper singleton class inside `server/database/routes.py` has been added to provide access (and creation) of databases. If you want to access the database, please import the `db` singleton object from the file instead of creating new ones. If you want to create a new database off the collection, just add a new property to `server/database/routes.py`.


Current Progress:
- [x] Initiatlized Flask Backend
- [x] Added Google OAuth2 Login/Logout Support
- [x] Link Flask Backend with React Frontend
- [x] Initial React Frontend for Home Page
- [x] Complete Authentication and Registration Workflow
- [ ] Initial Design for Team Import & Search Page 
<<<<<<< HEAD
- [ ] Initial Design for Team Building Form Template Page & Architecture
=======
- [ ] Initial Design for Team Building Form Template Page & Architecture
>>>>>>> 2cd861c47bc7e1c6df7c08136385da9e504e5276
