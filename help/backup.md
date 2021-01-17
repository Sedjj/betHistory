Упал метод exportBackup - Command failed: mongoexport  --host localhost --port 27017 --db rateBot --out /home/app/upload/footballs.json --collection footballs --type=json --pretty



mongodb-backup URI -q '{"username":"John Doe"}' -p json
mongodb-backup URI -c '["logins"]'

mongodb-backup dbUri -c '["logins"]' -p json -o /home/app/upload/footballs.json


Опции:
--verbose FILE Сохранить внутреннюю отчетность в лог-файл
--host STRING Определяет разрешимое имя хоста для mongod
-c, --cursors NUMBER Количество курсоров
-p, --parser [STRING] Анализатор данных (bson, json) (по умолчанию используется bson)
-o, --out [STRING] Указывает каталог, в котором сохраняется вывод (по умолчанию - dump /)
-r, --tar STRING Упаковать файлы в файл .tar
-c, --collections STRINGS указывает коллекцию для резервного копирования
-q, --query STRING Запрос, который необязательно ограничивает включаемые документы
-m, --metadata Сохранить метаданные коллекций как Index, ecc
-t, --timeout N Выход, если процесс занимает больше N секунд
-v, --version Показать текущую версию
-h, --help Показать справку и сведения об использовании



    mongo --username rate --password "0vI9pxggocZylOd" --authenticationDatabase rate rateBot --shell data/scripts/index.js --host mongo-rate --port 27017


