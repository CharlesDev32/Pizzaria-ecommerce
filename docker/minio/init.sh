#!/bin/sh
set -e

until (/usr/bin/mc alias set local http://minio:9000 minio minio123) do
  echo "Waiting for MinIO..."
  sleep 2
done

/usr/bin/mc mb -p local/products || true
/usr/bin/mc anonymous set download local/products || true
echo "MinIO bucket configured"
