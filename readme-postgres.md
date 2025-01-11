## Comandi postgres

Disable autostartup of postgresql version:

vi /etc/postgresql/14/main/start.conf

set to "manual"


Change port of a specific version (port =)

vi /etc/postgresql/14/main/postgresql.conf

- Verificare le versioni presenti
  - ls /etc/postgresql
- Verificare quelle running
  - sudo pg_lsclusters
- Start e stop di una versione specifica
  - sudo pg_ctlcluster 16 main start
  - sudo pg_ctlcluster 9.2 main stop
- Abilitare disabilitare start al boot
  - sudo systemctl disable postgresql@9.2-main
  - sudo systemctl enable postgresql@16-main
- Restart del servizio
  - sudo systemctl restart postgresql
- Collegarsi
  - sudo -u postgres psql
- Creare un ruolo
  - CREATE ROLE gestioneordini WITH LOGIN NOSUPERUSER INHERIT CREATEDB NOCREATEROLE NOREPLICATION;
- Creare database
  - create database gestioneordini with owner=gestioneordini encoding='UTF8' lc_collate='it_IT.UTF-8' lc_ctype='it_IT.UTF-8' tablespace=pg_default connection limit=25;
- Cambiare password
  - alter role gestioneordini with password 'gestioneordini';
- Collegarsi
  - \c gestioneordini
- Creare le tabelle
  CREATE TABLE "roles" (
  "role_id" integer PRIMARY KEY,
  "role" varchar,
  "created_at" timestamp
  );

CREATE TABLE "users" (
"id" integer PRIMARY KEY,
"username" varchar,
"role_id" integer,
"password" varchar,
"email" varchar,
"created_at" timestamp
);

CREATE TABLE "prodotti" (
"id" integer PRIMARY KEY,
"descrizione" varchar,
"grammatura" integer,
"peso_totale" integer,
"created_at" timestamp
);

CREATE TABLE "ordini" (
"id" integer PRIMARY KEY,
"seller" varchar,
"data_inserimento" timestamp,
"prodotto_id" integer,
"qty" integer,
"peso_totale" integer,
"notes" varchar,
"is_custom" bool,
"created_at" timestamp
);

CREATE TABLE "log" (
"id" integer PRIMARY KEY,
"severity" varchar,
"username" varchar,
"page" varchar,
"text" varchar,
"created_at" timestamp DEFAULT (now())
);

ALTER TABLE "users" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("role_id");

ALTER TABLE "ordini" ADD FOREIGN KEY ("prodotto_id") REFERENCES "prodotti" ("id");

gestioneordini=# GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO gestioneordini;
GRANT
gestioneordini=# GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE ordini TO gestioneordini;
GRANT
gestioneordini=# GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE roles TO gestioneordini;
GRANT
gestioneordini=# GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE prodotti TO gestioneordini;
GRANT
gestioneordini=# GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE log TO gestioneordini;

gestioneordini=# CREATE SEQUENCE users_id_seq;
CREATE SEQUENCE
gestioneordini=# ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
ALTER TABLE

gestioneordini=# GRANT USAGE, SELECT, UPDATE ON SEQUENCE users_id_seq TO gestioneordini;

INSERT INTO roles (role_id, role, created_at) VALUES
(1, 'admin', NOW()),
(2, 'seller', NOW()),
(3, 'user', NOW());

CREATE SEQUENCE log_id_seq;
alter table log alter column id set default nextval('log_id_seq');
grant usage, select, update on sequence log_id_seq to gestioneordini;