# inventory-application

# Overview

Inventory Application for [The Odin Project](https://www.theodinproject.com/lessons/nodejs-inventory-application)

## Preview

![](./public/images/Preview.png)

## The process

### Built with

- Pug
- Node (Express)
- SQL

### Running locally

To run the application locally:

1. Clone the repository:

   ```bash
   git clone git@github.com:Purpleboxe/inventory-application.git
   cd inventory-application
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up enviroment variables by creating a `.env` file in the root of the directory and add the following:

   ```env
   DATABASE_URL=your_postgresql_database
   ```

4. Set up the database by adding tables using the following:

   ```bash
   node db/setupDB.js
   ```

5. Start the server:

   ```bash
   npm run start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Conclusion

This inventory application includes all of the CRUD methods for both items and categories. It mainly uses Express and all of the items and categories are stored in MongoDB. With this project I've gained some practical experience in handling data operations and implementing a user-friendly interface. Although a large majority of this project does come from the MDN Local Library tutorial series I think so far it is a great stepping stone!
