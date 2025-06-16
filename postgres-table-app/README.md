# PostgreSQL Table Viewer

A Next.js application that connects to a PostgreSQL database, displays table data, and provides search functionality with AWS Cognito authentication.

## Features

- Secure authentication with AWS Cognito
- View data from any PostgreSQL table across multiple schemas
- Search table data by multiple column values simultaneously
- Filter date columns with date range pickers
- Typeahead search for table names
- Responsive table display
- TypeScript support
- Docker support for containerized deployment

## Setup

### Local Development

1. Install dependencies:

    ```bash
    npm install
    ```

2. Configure your PostgreSQL connection and AWS Cognito by editing the `.env.local` file (use `.env.local.example` as a template):

    ``` bash
    # Database Configuration
    POSTGRES_USER=your_username
    POSTGRES_PASSWORD=your_password
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_DATABASE=your_database

    # AWS Cognito Configuration
    NEXT_PUBLIC_COGNITO_REGION=us-east-1
    NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
    NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
    NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    ```

3. Run the development server:

    ```bash
    npm run dev
    ```

### Docker Deployment

1. Create a `.env` file with your environment variables (similar to `.env.local`).

2. Build and run the Docker container:

    ```bash
    # Build and start the container
    docker-compose up -d

    # Or build the image separately
    docker build -t postgres-table-app .
    docker run -p 3000:3000 --env-file .env postgres-table-app
    ```

3. Access the application at [http://localhost:3000](http://localhost:3000).

## AWS Cognito Setup

1. Create a User Pool in AWS Cognito
2. Create an App Client in the User Pool
3. Create an Identity Pool and link it to the User Pool
4. Update the environment variables with your Cognito details

## Usage

1. Log in with your Cognito user credentials
2. Select a database schema from the dropdown
3. Start typing a table name to see matching tables in the typeahead dropdown
4. Select a table and click "View Table"
5. View the table data on the table page
6. Use the search form to filter data by multiple column values
7. Use date range filters for date columns

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- AWS Cognito for authentication
- PostgreSQL (pg library)
- Docker
