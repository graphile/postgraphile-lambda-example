FROM postgres:12.3

ADD scripts/import-example-database.sh /docker-entrypoint-initdb.d
RUN mkdir /sql-temp
ADD scripts /sql-temp/
