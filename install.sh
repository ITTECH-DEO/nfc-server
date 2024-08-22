#!/bin/bash

# Periksa apakah Node.js sudah terinstal
if ! command -v node &> /dev/null
then
    echo "Node.js tidak terdeteksi, menginstal Node.js..."
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Clone repository jika belum ada (dalam hal ini sudah tidak perlu karena ini dalam repositori)
# echo "Cloning repository..."
# git clone https://github.com/ITTECH-DEO/nfc-server.git
# cd nfc-server

# Install npm dependencies
echo "Menginstal dependensi..."
npm install

# Jalankan server
echo "Menjalankan server..."
node server.js
