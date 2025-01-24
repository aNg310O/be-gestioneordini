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
- Cambiare DB
  - \c gestioneordini

CREATE ROLE gestioneordini WITH LOGIN NOSUPERUSER INHERIT CREATEDB NOCREATEROLE NOREPLICATION;
create database gestioneordini with owner=gestioneordini encoding='UTF8' lc_collate='it_IT.UTF-8' lc_ctype='it_IT.UTF-8' tablespace=pg_default connection limit=25;
alter role gestioneordini with password 'gestioneordini';
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
"valid" boolean default true,
"created_at" timestamp
);
CREATE TABLE "prodotti" (
"id" integer PRIMARY KEY,
"descrizione" varchar,
"grammatura" integer,
"peso_totale" integer,
"valid" boolean default true,
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
"is_custom" bool default false,
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
CREATE TABLE "config" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "value" VARCHAR(255) NOT NULL
);
ALTER TABLE "users" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("role_id");
ALTER TABLE "ordini" ADD FOREIGN KEY ("prodotto_id") REFERENCES "prodotti" ("id");
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO gestioneordini;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE ordini TO gestioneordini;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE roles TO gestioneordini;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE prodotti TO gestioneordini;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE log TO gestioneordini;
grant select, update, insert, delete on table config to gestioneordini;
CREATE SEQUENCE users_id_seq;
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
GRANT USAGE, SELECT, UPDATE ON SEQUENCE users_id_seq TO gestioneordini;
CREATE SEQUENCE log_id_seq;
alter table log alter column id set default nextval('log_id_seq');
grant usage, select, update on sequence log_id_seq to gestioneordini;
CREATE SEQUENCE prodotti_id_seq;
alter table prodotti alter column id set default nextval('prodotti_id_seq');
grant usage, select, update on sequence prodotti_id_seq to gestioneordini;
CREATE SEQUENCE ordini_id_seq;
alter table ordini alter column id set default nextval('ordini_id_seq');
grant usage, select, update on sequence ordini_id_seq to gestioneordini;
grant usage, select, update on sequence config_id_seq to gestioneordini;
INSERT INTO "config" ("name", "value") VALUES ('order_cutoff_hour', '18');
INSERT INTO roles (role_id, role, created_at) VALUES
(1, 'admin', NOW()),
(2, 'seller', NOW()),
(3, 'user', NOW());