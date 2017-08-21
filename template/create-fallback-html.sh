#!/usr/bin/env sh

for i in "$@"; do
  cd "$i";
  php index.php > index.html
  cd -
done
