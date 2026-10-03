#!/bin/bash

# Link static assets to /var/www/html so CSS and image changes take effect immediately
ln -sfn /pluto/css-v2 /var/www/html/css-v2
ln -sfn /pluto/images-v2 /var/www/html/images-v2
[ -d /pluto/assets ] && ln -sfn /pluto/assets /var/www/html/assets
[ -d /pluto/static ] && ln -sfn /pluto/static /var/www/html/static

# Build initial feeds if index.html is missing or FORCE_BUILD is set
if [ ! -f /var/www/html/index.html ] || [ "${FORCE_BUILD:-0}" = "1" ]; then
    echo "[start.sh] Generating initial Fedora Planet feed for local development..."
    cat << "EOF" > /tmp/planet.ini
title = Fedora People
url = fedoraplanet.org

[fedoramagazine]
name = Fedora Magazine
link = https://fedoramagazine.org
feed = https://fedoramagazine.org/?feed=rss2
avatar = https://fedoraplanet.org/images-v2/heads/planet-magazine.png
author = admin

[community-blog]
name = Fedora Community Blog
link = https://communityblog.fedoraproject.org
feed = https://communityblog.fedoraproject.org/?feed=rss
avatar = https://fedoraplanet.org/images-v2/heads/default.png
author = admin

[fedora-badges]
name = Fedora Badges
link = https://badges.fedoraproject.org
feed = https://badges.fedoraproject.org/explore/badges/rss
avatar = https://fedoraplanet.org/images-v2/heads/default.png
author = admin
EOF
    (cd /pluto && pluto build /tmp/planet.ini -o /var/www/html -d /var/www/html -t planet)
fi

truncate --size=0 /etc/httpd/logs/access_log /etc/httpd/logs/error_log /var/log/planet/build.log
tail -qf /etc/httpd/logs/access_log /etc/httpd/logs/error_log /var/log/planet/build.log &
exec /usr/sbin/httpd -D FOREGROUND -f /etc/httpd/conf/httpd.conf
