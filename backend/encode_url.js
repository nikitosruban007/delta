const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const url = envConfig.DATABASE_URL;

const protocol = 'postgresql://';
const rest = url.slice(protocol.length);
const firstColon = rest.indexOf(':');
const lastAt = rest.lastIndexOf('@');
const hostPart = rest.slice(lastAt + 1);
const userPassPart = rest.slice(0, lastAt);
const [user, ...passParts] = userPassPart.split(':');
const password = passParts.join(':');

console.log('Original Password:', password);
const encodedPassword = encodeURIComponent(password);
console.log('Encoded Password:', encodedPassword);

const newUrl = `${protocol}${user}:${encodedPassword}@${hostPart}`;
console.log('New URL:', newUrl);
