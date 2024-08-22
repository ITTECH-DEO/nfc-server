const express = require('express');
const { NFC, KEY_TYPE_A } = require('nfc-pcsc');
const bodyParser = require('body-parser');
const ndef = require('ndef');

const app = express();
const nfc = new NFC();

const nfc_new = new NFC();
let nfcReader = null;
const key = 'FFFFFFFFFFFF';

app.use(bodyParser.json());

let nfcInfo = {};
let nfcWriteInfo = null;

nfc_new.on('reader', reader =>{
    console.log(`${reader.reader.name}  device attached`);
    nfcReader = reader;

    reader.on('card', async card => {
        console.log(`${reader.reader.name}  card detected`, card);
    });

    reader.on('card.off', card => {
        console.log(`${reader.reader.name}  card removed`, card);
    });

    reader.on('error', err => {
        console.error(`${reader.reader.name}  an error occurred`, err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name}  device removed`);
        nfcReader = null;
    });
});

nfc_new.on('error', err => {
    console.error('An error occurred', err);
});


async function readData(reader) {
    try {
        const atr = reader.card.atr;
        const atrHex = atr.toString('hex');

        const standard = reader.card.standard;
        // console.log(reader.card.type);
        // console.log(reader.card.atr);
        // console.log(reader.card.standard);


        const uid = reader.card.uid;


        let cardType = reader.card.type


        await reader.authenticate(4, KEY_TYPE_A, key);
        const data = await reader.read(4, 16, 16);
        return {
            atr: atrHex,
            uid: uid,
            type: cardType,
            data: data.toString('utf8'),
            standard: standard
        };
    } catch (err) {
        throw new Error('Read error: ' + err);
    }
}


async function writeData(reader, text) {
    try {
        await reader.authenticate(4, KEY_TYPE_A, key);
        const dataToWrite = Buffer.from(text, 'utf8');
        await reader.write(4, dataToWrite, 16);
        const verifyData = await reader.read(4, 16, 16);
        return verifyData.toString('utf8');
    } catch (err) {
        console.error('Write error: ' + err);
        throw new Error('Write error: ' + err);
    }
}


app.get('/read', async (req, res) => {
    if (!nfcReader) {
        return res.status(400).send('No NFC reader connected');
    }
    try {
        const data = await readData(nfcReader);
        res.json({ data });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/write', async (req, res) => {
    if (!nfcReader) {
        return res.status(400).json({ error: 'No NFC reader connected' });
    }
    const { dataToWrite } = req.body;
    console.log(dataToWrite);
    try {
      
        const dataToWriteBuffer = Buffer.from(dataToWrite, 'utf8');
        if (dataToWriteBuffer.length > 16) {
            console.log(dataToWriteBuffer);
            return res.status(400).json({ error: 'Data length exceeds 16 bytes' });
        }

   
        const paddedData = Buffer.alloc(16);
        dataToWriteBuffer.copy(paddedData);


        const data = await writeData(nfcReader, paddedData.toString('utf8'));
        res.json({ message: `Data written and verified: ${data}` });
    } catch (err) {
        console.error("Error writing data:", err);
        res.status(500).json({ error: err.message });
    }
});

app.use(express.static('public'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
