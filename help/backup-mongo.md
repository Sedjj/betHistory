####Сделать дам на сервере
```bash
docker-compose exec -T mongo-rate mongodump --gzip -d rateBotNest --archive="D:\git\bet\bethistory\dump-14.04.gz"
```

#### Восстановление из бэкапа
```bash
docker-compose exec -T mongo-rate mongorestore --gzip --drop -d rateBotNest --archive="D:\git\bet\bethistory\dump-14.03.gz"
```
docker-compose exec -T mongo-rate_test mongo -u user -p 123456 --authenticationDatabase rateBotNest
docker-compose exec -T mongo-rate_test mongo rateBotNest -u root -p 123456

apt-get update && apt-get install nano

nano docker-entrypoint-initdb.d/mongo-init.js
ls -all docker-entrypoint-initdb.d

####Сделать дам на сервере
```bash
mongodump --gzip -d rateBot --archive="/home/rb-app/rate_bot/mongoDB/dump/rateBot-06.04.gz"
```

####Востановление из бэкапа
```bash
mongorestore --gzip --drop -d rateBot --archive="/data/dump/rateBot-06.04.gz"
```

####Обновить данные на компе
```bash
mongorestore --gzip --drop -d rateBot --archive="rateBot-06.04.gz"
```  

####Скопировать файл в докер
```bash
COPY "D:\git\bot\rate\mongoDB\dump\rateBot-06.04.gz" "localhost:27017/data/dump/rateBot-06.04.gz"
```

####Экспорт коллекции
```bash
mongoexport --type json --db rateBot --collection footballs --out data/dump/footballs.json
mongoexport --type json --db rateBot --collection tabletennis --out data/dump/tabletennis.json
```

####Импорт коллекции
```bash
docker exec mongo-rate mongoimport --type json --collection footballs --mode merge --db rateBot --file data/dump/footballs.json && docker exec mongo-rate mongoimport --type json --collection tabletennis --mode merge --db rateBot --file data/dump/tabletennis.json
```

####Копировать из докера нужный файл: где `nostalgic_kalam` находится через `docker ps` и берется поле `name`
```bash
docker cp  nostalgic_kalam:\data\db\statistics.json D:\git\bot\rate\mongoDB\dump
```

####Удалить данные из базы через консоль
```mongo
mongo rateBotNest
db.tabletennis.drop();
db.footballs.drop();
```