# AMAZON Q Generated Projects

## Welcome to Vibe Coding

This repository contains projects which have been generated with help of Amazon Q in Code assistant mode with prompts in Visual Studio Code.

> NOT PRODUCTION READY AT ALL ! USE WITH CAUTION AND AT YOUR OWN RISK.

The application - `postgres-table-app` is a database browser application built using NextJS (v14) and Typescript, which connects to PostgreSQL database to browse tables and search columns.

## Developer Set up

- Visual Studio Code
- Amazon Q - VS Code Extension
- PostgreSQL - VS Code Extension (Publisher: Microsoft)
- Amazon Builder ID - registration required
- Docker Desktop (on Windows 11 laptop)
- Docker Image - PostgreSQL database

### Running the Database

This is a pre-requisite to run this project, so to have a running database server. To accomplish that locally, I used Docker and office PostgresSQL image in Docker Hub.

Run the docker image as:

``` shell
docker run --name postgres -p 5432:5432  -e POSTGRES_PASSWORD=mysecretpassword -d postgres  
```

1. Connect to the `postgres` database on the PostgreSQL server and create new database eg - `emails`.
2. Switch to `emails` database and execute the `database.sql` script in the `database` folder to create sample tables and rows.
3. Create a new file called -  `.env.local` file in `postgres-table-app` with syntax provided in the [README.md](./postgres-table-app/README.md) file in that folder and update the database credentials.
4. On the terminal, navigate to the `postgres-table-app` folder and follow the instructions in the [README.md](./postgres-table-app/README.md) to run the application.

## Prompts used (so far)

``` text
Create a nextjs project using typescript that reads tables in PostgreSQL database. renders it as table and is able to search on columns in the table
```

``` text
Change the search to be able to include multiple columns at a time and add support for date ranges
```

``` text
Please add a .gitignore file to the project
```

``` text
How about adding support for multiple database schemas and drop down with type ahead of tables in the database on the home page?
```
