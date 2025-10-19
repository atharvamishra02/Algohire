$env:PGPASSWORD = 'algopass'
psql -h localhost -U algo -d algodb -f server/db/init.sql
