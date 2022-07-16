# Развёртывание приложения на Ubuntu 18.04

## Базовые настройки

### Создать пользователя `docker`:
```bash
sudo adduser docker &&
sudo adduser docker sudo &&
sudo gpasswd -a docker sudo &&
usermod -aG sudo docker
```
Войти в систему под пользователем `docker`.

Смена пароля root
```bash
sudo bash &&
passwd root
```

### Обновить список пакетов:
```bash
sudo apt-get update &&
sudo apt-get upgrade
```

### Установка диспетчера задач
```bash
sudo apt-get install htop
```

### Установка netcat для проверки открытых портов
```bash
sudo apt-get install netcat
```

### Установка часового пояса
```bash
sudo dpkg-reconfigure tzdata &&
sudo /etc/init.d/cron stop &&
sudo /etc/init.d/cron start &&
timedatectl
```  

## Установить MongoDB

###[Установить MongoDB 5.0](https://computingforgeeks.com/how-to-install-mongodb-database-on-ubuntu/):

```shell     
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/5.0 multiverse" | 
sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt-get install -y mongodb-org=5.0.9 mongodb-org-database=5.0.9 mongodb-org-server=5.0.9 mongodb-org-shell=5.0.9 mongodb-org-mongos=5.0.9 mongodb-org-tools=5.0.9
```

###[Установить MongoDB](https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/):

```shell     
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 4B7C549A058F8B6B && 
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | 
sudo tee /etc/apt/sources.list.d/mongodb.list &&
sudo apt-get update &&
sudo apt-get install -y mongodb-org
```

После установки MongoDB запустится автоматически. Для запуска или остановки MongoDB использует скрипт инициализации. Ниже приведены примеры команд для выполнения.
```bash
sudo systemctl enable mongod
sudo systemctl start mongod 
sudo systemctl unmask mongod 
```

Наконец, используйте команду ниже, чтобы проверить установленную версию MongoDB в вашей системе.
```bash
mongod --version 
```

Также подключите MongoDB с помощью командной строки и выполните несколько тестовых команд для проверки правильности работы.
```mongo
mongosh 

use mydb;

db.mydb.insertOne( { tecadmin: 100 } );
db.mydb.save( { tecadmin: 100 } )

db.mydb.find()
```

#####Команды работы с mongoDB
```bash
sudo systemctl status mongod
sudo systemctl stop mongod
sudo systemctl start mongod
sudo systemctl restart mongod
```

#####Удалить  mongodb
```bash
sudo service mongod stop &&
sudo apt-get purge mongodb-org* &&
sudo rm -r /let/log/mongodb &&
sudo rm -r /let/lib/mongodb
```  

#####Тест работы
```bash
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

## Настройка Docker

### Устанавливаем Docker

Устанавливаем необходимые пакеты, которые позволяют apt использовать пакеты по HTTPS:
```bash
sudo apt install wget curl gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
```

Затем добавляем в свою систему ключ GPG официального репозитория Docker:
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

Добавляем репозиторий Docker в список источников пакетов APT:
```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" &&
sudo apt update && 
pt-cache policy docker-ce
```      

Далее устанавливаем Docker:
```bash
sudo apt install docker-ce
```

Теперь Docker установлен, демон запущен, и процесс будет запускаться при загрузке системы.  Убедимся, что процесс запущен:
```bash
sudo systemctl status docker
```

## Настроим docker что бы проброс портов не обходил UFW

Откроем файл настроек docker
```bash
sudo nano /etc/default/docker
```

Меняем в конфиге параметр
```bash
DOCKER_OPTS="--iptables=false"
```

Перезапускам docker
```bash
sudo systemctl restart docker
```
Теперь, когда вы развертываете контейнер, он больше не будет изменять iptables и будет учитывать UFW
 
 
### Настройка Docker compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose &&
sudo chmod +x /usr/local/bin/docker-compose &&
docker-compose --version
```

Данная команда нужна для переопределения расхода памяти [https://access.redhat.com/documentation/ru-ru/red_hat_enterprise_linux/6/html/performance_tuning_guide/s-memory-captun]
```bash
sudo sysctl vm.overcommit_memory=1
```

## Некая полезная документация по docker-compose
```
https://dker.ru/docs/docker-compose/compose-file-reference/
```

## Настройка безопасности

### Создание пользователя для БД

Чтобы добавить нашего пользователя, мы подключимся к оболочке Mongo:
```bash
mongosh   
```

Вам необходимо использовать базу данных `admin`. Введите следующую команду в приглашении, чтобы создать своего суперпользователя: 
```bash   
use admin
```
результат `switched to db admin` 

Далее создает пользователя `adminRate` в базе данных администратора с ролью userAdminAnyDatabase
```bash  
db.createUser(
  {
    user: "adminRate",
    pwd: "7bdeW7XkuzI7uI3pa5k6e7984W7XkuzI7VAFnIuFAir774645c2b543d",
    roles: [ { role: "root", db: "admin" } ]
  }
) 
``` 

Отключите оболочку Монго, введя следующую команду:
```bash
exit   
```

Отредактируйте `/etc/mongod.conf` или `/usr/local/etc/mongod.conf`, введите:  
```bash
sudo nano /etc/mongod.conf  
```
и добавляем запись
```bash
systemLog:
 destination: file
 path: /usr/local/var/log/mongodb/mongo.log
 logAppend: true
storage:
 dbPath: /usr/local/var/mongodb
net:
 bindIp: 127.0.0.1
security:
 authorization: enabled
```

Сохраните и закройте файл. Перезапустите экземпляр MongoDB:
```bash
sudo service mongod restart
```

Для аутентификации во время соединения, используя пользователя admin и пароль для базы данных администратора:
 ```bash
mongosh --port 27017 -u adminRate -p 7bdeW7XkuzI7uI3pa5k6e7984W7XkuzI7VAFnIuFAir774645c2b543d --authenticationDatabase admin
```


Добавьте дополнительного пользователя в вашу БД. Сначала создайте новую базу данных под названием «rateBotNest»:
 ```bash
use rateBotNest
```                  

Создайте пользователя с именем «rate» с паролем с именем «7bdeW7XkuzI7uI3pa5k6e7984W7XkuzI7VAFnIuFAir774645c2b543d» для rate db:
```bash   
db.createUser(
  {
   user: "rate",
   pwd: "7bdeW7XkuzI7uI3pa5k6e7984W7XkuzI7VAFnIuFAir774645c2b543d",
   roles: [ "readWrite"]
  })
```

### Настройка брандмауэра UFW

#### Включение UFW:
```bash
sudo ufw enable
sudo ufw disable
```

#### Проверка настроек:
```bash
sudo ufw status verbose
```

#### Включение ftp:
```bash
sudo ufw allow ftp
```

#### Включение ssh:
```bash
sudo ufw allow ssh
```

#### Включение web-service:
```bash
sudo ufw allow 3000/tcp
``` 

#### Включение mongo (209.222.30.94 - текущий сервер):
```bash
sudo ufw allow from  209.222.30.94 to any port 27017
```

#### Некоторые полезные команды:
добавить порт
```bash
sudo ufw allow 27017/tcp
``` 

закрыть порт
```bash
sudo ufw deny 27017/tcp
```

Несмотря на то, что порт открыт, MongoDB в настоящее время только прослушивает локальный адрес `127.0.0.1`. Чтобы разрешить удаленные подключения, добавьте публично маршрутизируемый IP-адрес вашего сервера в `mongod.conf` файл.

Откройте файл конфигурации MongoDB в редакторе:
```bash
sudo nano /etc/mongod.conf  
```

```bash
logappend=true

net:
  port: 27017
  bindIp: 127.0.0.1,172.17.0.1,your_server_ip
```
Обязательно поместите запятую между существующим IP-адресом и тем, который вы добавили.

`172.17.0.1` это адрес моста в докере `docker network inspect bridge`

После нужно перезагрузить службу
```bash
sudo systemctl restart mongod
```

#### Сохраните файл, выйдите из редактора и перезапустите MongoDB:
```bash
sudo systemctl restart mongod
```

## Настройка Gitlab Runner
```bash
sudo curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash &&
sudo apt-get install gitlab-runner

sudo gitlab-runner register -n \
  --url https://gitlab.com/ \
  --registration-token xkkhhDo5iNBFM3fq3s1Y \
  --executor shell \
  --description "Prod Runner" \
  --docker-privileged \
  --tag-list docker
  
sudo gitlab-runner restart
```

Маленькая, но очень нужная настройка, добавление пользователя `gitlab-runner` в группу `docker`.
```bash
sudo usermod -aG docker gitlab-runner
```

Как только служба Docker настроена на автоматический запуск после перезагрузки `VPS`, все контейнеры Docker также будут запускаться автоматически. Все ваши приложения, работающие в контейнерах Docker, вернутся в онлайн без какого-либо ручного вмешательства.
```bash
sudo systemctl enable docker
sudo systemctl disable docker
``` 

Для изменения параметров `gitlab-runner`
```bash
sudo nano /etc/gitlab-runner/config.toml
```                                   

Когда `runner` удаляется из пользовательского интерфейса Gitlab Admin, эта команда удаляет его, обновляя `config.toml`
```bash
sudo gitlab-runner verify --delete
``` 