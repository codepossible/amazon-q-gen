# PostgreSQL Table Viewer

A Next.js application that connects to a PostgreSQL database, displays table data, and provides search functionality.

## Features

- View data from any PostgreSQL table across multiple schemas
- Search table data by multiple column values simultaneously
- Filter date columns with date range pickers
- Typeahead search for table names
- Responsive table display
- TypeScript support

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure your PostgreSQL connection by editing the `.env.local` file:

```
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=your_database
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Select a database schema from the dropdown
2. Start typing a table name to see matching tables in the typeahead dropdown
3. Select a table and click "View Table"
4. View the table data on the table page
5. Use the search form to filter data by multiple column values
6. Use date range filters for date columns

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- PostgreSQL (pg library)