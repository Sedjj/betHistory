public-key:
`ssh-rsa AAAAB3NzaC1yc2EAAAABJQAAAQEAiNhJRm43d9GJRS8KdUD1vVYoZ9SOxHLtwYBSzc00M5LsZ4cU7sfEdeeHclnqdW1ZKShBDyW+vEA7612aeeJN4eZCza9zOJrlbEbWCC3N36NELZBCJXIit7uI3pa5k6pftnAiW7XkuzI1idBrddM3nONYbXBk2UTIcYcb0Pl6OqGCddfO7WQWBK3uAYjP8CukR9eA3AaOzY4iJvEsLzr2DUcZGckHsGguMurdlW+EAqDImG9xQ0vtF0TYLESEjykoHpuPIzrKu7lNlHeVgGF+InLTCzO5mWNRCHCyk4RROkNSQHZdQV/+AFnIuFA/ir72787CcXbjfJRSIIwjG8jo5Q== rsa-key-20181201`

pass от ppk:
`X]vNyJ5XKh3kM3KlCQqr`

*********************************************************************************************************************************************************************

IP сервера: 209.222.30.94
Имя пользователя: `docker`
Пароль: `7bdeW7XkuzI7uI3pa5k6e7984W7XkuzI7VAFnIuFAir774645c2b543d6f68db9VgGFInL151e5`

 
*********************************************************************************************************************************************************************

Connect к БД

mongo "mongodb://rate:7bdeW7XkuzI7uI3pa5k6e7984W7XkuzI7VAFnIuFAir774645c2b543d@localhost:27017/rateBotNest"

db.getCollection('configs').find({})

db.getCollection('footballs').find({})

db.getCollection('stacks').find({})
db.getCollection('configs').find({})

db.configs.drop();
db.stacks.drop();
db.footballs.drop();
db.version()

db.getCollection('footballs').find({marketId: "1.187123666"})


sudo tail -100000 /var/log/mongodb/mongod.log >> test1.log

docker system prune -a -f --volumes