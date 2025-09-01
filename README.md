# Partner Portal Backend

This is a Node.js backend project using Express.js and MySQL. No ORM is used; all database operations are performed using raw SQL queries.

## Features
- Node.js + Express.js server
- MySQL database connection
- Raw SQL queries (no ORM)

## Getting Started

### Prerequisites
- Node.js (v16 or later recommended)
- MySQL server

### Installation
1. Clone this repository or copy the project files.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure your MySQL database connection in `db.js`.
4. Start the server:
   ```sh
   npm start
   ```

## Project Structure
- `index.js` - Entry point for the Express server
- `db.js` - MySQL connection setup
- `routes/` - Express route handlers

## Notes
- All SQL queries are written manually (no ORM).
- Update the database credentials in `db.js` as needed.
