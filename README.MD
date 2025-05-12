# Docker compose demo with Spring Backend, React front end and Postgresql DB.

### Create a docker-volume before starting the docker compose.

docker volume create employee-pg-data <br/>

### Start the docker compose from the parent directory.
cd crud-springboot-reactjs-docker  <br/>
docker compose up -d <br/>

### To delete all the data from Docker
docker compose down <br/>
docker volume rm employee-pg-data <br/>
docker rmi -f $(docker images -aq) <br/>

The original project is fork from https://github.com/RameshMF/ReactJS-Spring-Boot-CRUD-Full-Stack-App