# Docker compose demo with Spring Backend, React front end and Postgresql DB.

### Create a docker-volume before starting the docker compose.

docker volume create employee-pg-data

### Start the docker compose from the parent directory.
cd crud-springboot-reactjs-docker
docker compose up -d

### To delete all the data from Docker
docker compose down
docker volume rm employee-pg-data
docker rmi -f $(docker images -aq)

The original project is fork from https://github.com/RameshMF/ReactJS-Spring-Boot-CRUD-Full-Stack-App