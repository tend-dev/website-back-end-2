# install env
install docker && docker compose
npm i
# create folder for upload and volume for mySql
mkdir ./uploads
mkdir ~/var/lib/mysql-docker
# launch mySql container
./mySql/make start
# check it
./mySql/make ls
# apply migrations
./make up
# setup admin user
create admin user in table users
name, email, pass is required
note: for generate pass check bcrypt in auth.getHash()
# compile & run backend
npm start
# compile & run frontend
copy build to dist/frontend
