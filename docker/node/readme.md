Удаление всех контейнеров
```bash
docker system prune -a -f --volumes
```

Сборка контейнера
```bash
docker build --rm -t rate -f docker/node/DockerFile .
```

Запуск Контейнера
```bash
docker run -p -i -t rate
```

##Запуск pm2
```bash
pm2 start npm --start
```

Для просмотра списока задач используется `pm2 list`
```bash
pm2 list
```
 
Для просмотра работы задачи используется `pm2 monit`. Это отображает состояние приложения, CPU и использование памяти
```bash
pm2 monit
```

Для просмотра детальной информации о задаче используется `pm2 show app_name_or_id`
```bash
pm2 show npm
```

Для остановки задачи используется `pm2 stop app_name_or_id`
```bash
pm2 stop npm
```

Для удаление задачи используется `pm2 delete app_name_or_id`
```bash
pm2 delete npm
```

Для перезапуск задачи используется `pm2 restart app_name_or_id`
```bash
pm2 restart npm
```