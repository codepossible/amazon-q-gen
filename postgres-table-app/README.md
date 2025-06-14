# PostgreSQL Table Viewer

A Next.js application that connects to a PostgreSQL database, displays table data, and provides search functionality.

## Features

- View data from any PostgreSQL table
- Search table data by column values
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

1. Enter the name of the PostgreSQL table you want to view on the home page.
2. View the table data on the table page.
3. Use the search form to filter data by column values.

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- PostgreSQL (pg library)