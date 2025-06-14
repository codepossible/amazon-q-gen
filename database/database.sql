DROP TABLE IF EXISTS newsletter_recipients;
DROP TABLE IF EXISTS newsletters;
DROP TABLE IF EXISTS recipients;


CREATE TABLE recipients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE newsletters (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    body_template TEXT NOT NULL,
    date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);



CREATE TABLE newsletter_recipients (
    id SERIAL PRIMARY KEY,
    newsletter_id INT REFERENCES newsletters(id),
    email VARCHAR(255),
    body TEXT NOT NULL,
    sent_date DATE,
    is_delivered BOOLEAN DEFAULT FALSE
);



INSERT INTO recipients (name, email) VALUES ('John Doe', 'john.doe@example.com');
INSERT INTO recipients (name, email) VALUES ('Jane Smith', 'jane.smith@example.com');
INSERT INTO recipients (name, email) VALUES ('Alice Johnson', 'alice.johnson@example.com');

INSERT INTO newsletters (subject, body_template, date) VALUES ('Weekly Newsletter', 'This is a weekly newsletter.', '2023-05-01');
INSERT INTO newsletters (subject, body_template, date) VALUES ('Monthly Newsletter', 'This is a monthly newsletter.', '2023-05-01');

DROP TABLE IF EXISTS newsletter_recipients;


INSERT INTO newsletter_recipients (newsletter_id, email, body, sent_date) VALUES (1, 'john.doe@example.com', 'This is a weekly newsletter.', '2023-05-01');
INSERT INTO newsletter_recipients (newsletter_id, email, body, sent_date) VALUES (1, 'jane.smith@example.com', 'This is a weekly newsletter.', '2023-05-01');
INSERT INTO newsletter_recipients (newsletter_id, email, body, sent_date) VALUES (1, 'alice.johnson@example.com', 'This is a weekly newsletter.', '2023-05-01');