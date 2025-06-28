const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Hash detection function
function detectHashType(hash) {
  const patterns = {
    md5: /^[a-fA-F0-9]{32}$/,
    sha1: /^[a-fA-F0-9]{40}$/,
    sha256: /^[a-fA-F0-9]{64}$/,
    sha512: /^[a-fA-F0-9]{128}$/,
    bcrypt: /^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/,
    sha224: /^[a-fA-F0-9]{56}$/,
    sha384: /^[a-fA-F0-9]{96}$/,
    ripemd160: /^[a-fA-F0-9]{40}$/,
    whirlpool: /^[a-fA-F0-9]{128}$/
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(hash)) {
      return type;
    }
  }
  return 'unknown';
}

// Hash generation functions
function generateHash(text, algorithm) {
  switch (algorithm.toLowerCase()) {
    case 'md5':
      return CryptoJS.MD5(text).toString();
    case 'sha1':
      return CryptoJS.SHA1(text).toString();
    case 'sha256':
      return CryptoJS.SHA256(text).toString();
    case 'sha512':
      return CryptoJS.SHA512(text).toString();
    case 'sha224':
      return CryptoJS.SHA224(text).toString();
    case 'sha384':
      return CryptoJS.SHA384(text).toString();
    case 'ripemd160':
      return CryptoJS.RIPEMD160(text).toString();
    case 'whirlpool':
      return CryptoJS.Whirlpool(text).toString();
    default:
      throw new Error('Unsupported hash algorithm');
  }
}

// Enhanced dictionary-based hash cracking
async function crackHash(hash, algorithm, dictionary = []) {
  // Much larger dictionary of common passwords
  const commonPasswords = [
    // Top 100 most common passwords
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'football',
    'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
    'ranger', 'iwantu', 'jennifer', 'hunter', 'buster', 'soccer', 'baseball',
    'tiger', 'charlie', 'andrew', 'michelle', 'love', 'sunshine', 'jessica',
    'asshole', '696969', 'amanda', 'apple', 'summer', 'hello', 'freedom',
    'computer', 'sexy', 'thunder', 'ginger', 'hammer', 'silver', '222222',
    'bigtits', '22222222', 'qwertyuiop', 'zxcvbnm', 'fuckyou', 'bitch',
    'internet', 'service', 'tucker', 'marvin', 'camaro', 'boomer', 'charlie',
    'birdie', 'bigdog', 'golf', 'ranger', 'gators', 'maggie', 'dolphin',
    'packers', 'rosebud', 'bunny', 'swimming', 'dolphins', 'gordon', 'casper',
    'stupid', 'saturn', 'gemini', 'apples', 'august', 'canon', 'blowme',
    'sierra', 'savannah', 'player', 'enter', 'mercedes', 'bunny', 'tiger',
    'doctor', 'gateway', 'gators', 'angel', 'junior', 'thx1138', 'porno',
    'badass', 'blowjob', 'spider', 'melissa', 'booger', '1212', 'flyers',
    'fish', 'porn', 'matrix', 'teens', 'scooby', 'jason', 'walter', 'cumshot',
    'boston', 'tiger', 'marine', 'chicago', 'rangers', 'gandalf', 'winter',
    'bigtits', 'barney', 'edward', 'raiders', 'porn', 'badass', 'blowme',
    'spanky', 'bigdaddy', 'johnson', 'chester', 'london', 'midnight', 'blue',
    'fishing', '000000', 'hacker', 'slayer', 'matt', 'russia', 'scorpio',
    'rebecca', 'tester', 'mistress', 'phantom', 'billy', '666666', 'albert',
    'andrew', 'calvin', 'chris', 'derek', 'dolphin', 'dolphins', 'erik',
    'groovy', 'heather', 'jack', 'jackie', 'jason', 'jessica', 'jordan',
    'kelly', 'killer', 'knight', 'lacrosse', 'lakers', 'london', 'matt',
    'michelle', 'miller', 'mistress', 'phantom', 'player', 'qwerty',
    'ranger', 'rangers', 'rebecca', 'redsox', 'robert', 'scorpio', 'slayer',
    'steve', 'tester', 'tiger', 'tigers', 'trustno1', 'viking', 'white',
    'wizard', 'yellow', 'zappa', 'zebra', 'zombie',
    
    // Common variations
    'password1', 'password2', 'password123', 'password1234', 'password12345',
    '1234567890', '12345678901', '123456789012', 'qwerty123', 'qwerty1234',
    'abc123456', 'abc123456789', 'admin123', 'admin1234', 'admin12345',
    'letmein123', 'welcome123', 'monkey123', 'dragon123', 'master123',
    'football123', 'hello123', 'freedom123', 'whatever123', 'qazwsx123',
    'trustno1123', 'jordan123', 'harley123', 'ranger123', 'iwantu123',
    'jennifer123', 'hunter123', 'buster123', 'soccer123', 'baseball123',
    'tiger123', 'charlie123', 'andrew123', 'michelle123', 'love123',
    'sunshine123', 'jessica123', 'asshole123', '696969123', 'amanda123',
    'apple123', 'summer123', 'computer123', 'sexy123', 'thunder123',
    'ginger123', 'hammer123', 'silver123', '222222123', 'bigtits123',
    'qwertyuiop123', 'zxcvbnm123', 'fuckyou123', 'bitch123', 'internet123',
    'service123', 'tucker123', 'marvin123', 'camaro123', 'boomer123',
    'birdie123', 'bigdog123', 'golf123', 'gators123', 'maggie123',
    'dolphin123', 'packers123', 'rosebud123', 'bunny123', 'swimming123',
    'dolphins123', 'gordon123', 'casper123', 'stupid123', 'saturn123',
    'gemini123', 'apples123', 'august123', 'canon123', 'blowme123',
    'sierra123', 'savannah123', 'player123', 'enter123', 'mercedes123',
    'doctor123', 'gateway123', 'angel123', 'junior123', 'thx1138123',
    'porno123', 'badass123', 'blowjob123', 'spider123', 'melissa123',
    'booger123', '1212123', 'flyers123', 'fish123', 'porn123', 'matrix123',
    'teens123', 'scooby123', 'jason123', 'walter123', 'cumshot123',
    'boston123', 'marine123', 'chicago123', 'rangers123', 'gandalf123',
    'winter123', 'barney123', 'edward123', 'raiders123', 'badass123',
    'blowme123', 'spanky123', 'bigdaddy123', 'johnson123', 'chester123',
    'london123', 'midnight123', 'blue123', 'fishing123', '000000123',
    'hacker123', 'slayer123', 'matt123', 'russia123', 'scorpio123',
    'rebecca123', 'tester123', 'mistress123', 'phantom123', 'billy123',
    '666666123', 'albert123', 'calvin123', 'chris123', 'derek123',
    'erik123', 'groovy123', 'heather123', 'jack123', 'jackie123',
    'kelly123', 'killer123', 'knight123', 'lacrosse123', 'lakers123',
    'steve123', 'tigers123', 'viking123', 'white123', 'wizard123',
    'yellow123', 'zappa123', 'zebra123', 'zombie123',
    
    // Common words and names
    'test', 'guest', 'user', 'demo', 'sample', 'example', 'default',
    'root', 'system', 'server', 'host', 'localhost', 'admin', 'administrator',
    'user1', 'user2', 'user123', 'test123', 'guest123', 'demo123',
    'john', 'jane', 'mike', 'dave', 'bob', 'alice', 'tom', 'jerry',
    'john123', 'jane123', 'mike123', 'dave123', 'bob123', 'alice123',
    'tom123', 'jerry123', 'john1', 'jane1', 'mike1', 'dave1', 'bob1',
    'alice1', 'tom1', 'jerry1', 'john2', 'jane2', 'mike2', 'dave2',
    'bob2', 'alice2', 'tom2', 'jerry2',
    
    // Common patterns
    '111111', '222222', '333333', '444444', '555555', '666666', '777777',
    '888888', '999999', '000000', '123123', '321321', '456456', '654654',
    '789789', '987987', '11111111', '22222222', '33333333', '44444444',
    '55555555', '66666666', '77777777', '88888888', '99999999', '00000000',
    '12345678', '87654321', '11223344', '44332211', '12121212', '21212121',
    '123321', '321123', '456654', '654456', '789987', '987789',
    
    // Years and dates
    '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016',
    '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007',
    '2006', '2005', '2004', '2003', '2002', '2001', '2000', '1999', '1998',
    '1997', '1996', '1995', '1994', '1993', '1992', '1991', '1990', '1989',
    '1988', '1987', '1986', '1985', '1984', '1983', '1982', '1981', '1980',
    '1979', '1978', '1977', '1976', '1975', '1974', '1973', '1972', '1971',
    '1970', '1969', '1968', '1967', '1966', '1965', '1964', '1963', '1962',
    '1961', '1960', '1959', '1958', '1957', '1956', '1955', '1954', '1953',
    '1952', '1951', '1950',
    
    // Common phrases
    'letmein', 'letmein1', 'letmein123', 'letmein1234', 'letmein12345',
    'welcome', 'welcome1', 'welcome123', 'welcome1234', 'welcome12345',
    'password', 'password1', 'password12', 'password123', 'password1234',
    'password12345', 'password123456', 'password1234567', 'password12345678',
    'admin', 'admin1', 'admin12', 'admin123', 'admin1234', 'admin12345',
    'admin123456', 'admin1234567', 'admin12345678', 'root', 'root1',
    'root12', 'root123', 'root1234', 'root12345', 'root123456', 'root1234567',
    'root12345678', 'user', 'user1', 'user12', 'user123', 'user1234',
    'user12345', 'user123456', 'user1234567', 'user12345678', 'guest',
    'guest1', 'guest12', 'guest123', 'guest1234', 'guest12345', 'guest123456',
    'guest1234567', 'guest12345678', 'test', 'test1', 'test12', 'test123',
    'test1234', 'test12345', 'test123456', 'test1234567', 'test12345678',
    'demo', 'demo1', 'demo12', 'demo123', 'demo1234', 'demo12345', 'demo123456',
    'demo1234567', 'demo12345678', 'sample', 'sample1', 'sample12', 'sample123',
    'sample1234', 'sample12345', 'sample123456', 'sample1234567', 'sample12345678',
    'example', 'example1', 'example12', 'example123', 'example1234', 'example12345',
    'example123456', 'example1234567', 'example12345678', 'default', 'default1',
    'default12', 'default123', 'default1234', 'default12345', 'default123456',
    'default1234567', 'default12345678',
    
    // Common keyboard patterns
    'qwerty', 'qwerty1', 'qwerty12', 'qwerty123', 'qwerty1234', 'qwerty12345',
    'qwerty123456', 'qwerty1234567', 'qwerty12345678', 'qwertyuiop',
    'qwertyuiop1', 'qwertyuiop12', 'qwertyuiop123', 'qwertyuiop1234',
    'qwertyuiop12345', 'qwertyuiop123456', 'qwertyuiop1234567', 'qwertyuiop12345678',
    'asdfghjkl', 'asdfghjkl1', 'asdfghjkl12', 'asdfghjkl123', 'asdfghjkl1234',
    'asdfghjkl12345', 'asdfghjkl123456', 'asdfghjkl1234567', 'asdfghjkl12345678',
    'zxcvbnm', 'zxcvbnm1', 'zxcvbnm12', 'zxcvbnm123', 'zxcvbnm1234',
    'zxcvbnm12345', 'zxcvbnm123456', 'zxcvbnm1234567', 'zxcvbnm12345678',
    '123456789', '1234567890', '12345678901', '123456789012', '1234567890123',
    '12345678901234', '123456789012345', '1234567890123456', '12345678901234567',
    '123456789012345678', '987654321', '9876543210', '98765432109', '987654321098',
    '9876543210987', '98765432109876', '987654321098765', '9876543210987654',
    '98765432109876543', '987654321098765432',
    
    // Common words with numbers
    'password1', 'password2', 'password3', 'password4', 'password5',
    'password6', 'password7', 'password8', 'password9', 'password0',
    'admin1', 'admin2', 'admin3', 'admin4', 'admin5', 'admin6', 'admin7',
    'admin8', 'admin9', 'admin0', 'user1', 'user2', 'user3', 'user4',
    'user5', 'user6', 'user7', 'user8', 'user9', 'user0', 'test1',
    'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8',
    'test9', 'test0', 'guest1', 'guest2', 'guest3', 'guest4', 'guest5',
    'guest6', 'guest7', 'guest8', 'guest9', 'guest0', 'demo1', 'demo2',
    'demo3', 'demo4', 'demo5', 'demo6', 'demo7', 'demo8', 'demo9', 'demo0',
    'sample1', 'sample2', 'sample3', 'sample4', 'sample5', 'sample6',
    'sample7', 'sample8', 'sample9', 'sample0', 'example1', 'example2',
    'example3', 'example4', 'example5', 'example6', 'example7', 'example8',
    'example9', 'example0', 'default1', 'default2', 'default3', 'default4',
    'default5', 'default6', 'default7', 'default8', 'default9', 'default0',
    'root1', 'root2', 'root3', 'root4', 'root5', 'root6', 'root7',
    'root8', 'root9', 'root0', 'system1', 'system2', 'system3', 'system4',
    'system5', 'system6', 'system7', 'system8', 'system9', 'system0',
    'server1', 'server2', 'server3', 'server4', 'server5', 'server6',
    'server7', 'server8', 'server9', 'server0', 'host1', 'host2',
    'host3', 'host4', 'host5', 'host6', 'host7', 'host8', 'host9', 'host0',
    'localhost1', 'localhost2', 'localhost3', 'localhost4', 'localhost5',
    'localhost6', 'localhost7', 'localhost8', 'localhost9', 'localhost0',
    'administrator1', 'administrator2', 'administrator3', 'administrator4',
    'administrator5', 'administrator6', 'administrator7', 'administrator8',
    'administrator9', 'administrator0'
  ];

  const testPasswords = dictionary.length > 0 ? dictionary : commonPasswords;
  
  console.log(`Attempting to crack hash: ${hash} with algorithm: ${algorithm}`);
  console.log(`Testing ${testPasswords.length} passwords...`);
  
  for (let i = 0; i < testPasswords.length; i++) {
    const password = testPasswords[i];
    try {
      let testHash;
      if (algorithm === 'bcrypt') {
        testHash = await bcrypt.hash(password, 10);
        if (await bcrypt.compare(password, hash)) {
          console.log(`Hash cracked! Password found: ${password}`);
          return { found: true, password, algorithm };
        }
      } else {
        testHash = generateHash(password, algorithm);
        if (testHash.toLowerCase() === hash.toLowerCase()) {
          console.log(`Hash cracked! Password found: ${password}`);
          return { found: true, password, algorithm };
        }
      }
      
      // Log progress every 100 attempts
      if ((i + 1) % 100 === 0) {
        console.log(`Tested ${i + 1}/${testPasswords.length} passwords...`);
      }
    } catch (error) {
      console.error(`Error testing password "${password}": ${error.message}`);
    }
  }
  
  console.log(`Hash not found after testing ${testPasswords.length} passwords`);
  return { found: false, password: null, algorithm };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hash Hush API is running' });
});

app.post('/api/detect', (req, res) => {
  try {
    const { hash } = req.body;
    
    if (!hash) {
      return res.status(400).json({ error: 'Hash is required' });
    }
    
    const detectedType = detectHashType(hash);
    
    res.json({
      hash,
      detectedType,
      confidence: detectedType !== 'unknown' ? 'high' : 'low'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error detecting hash type' });
  }
});

app.post('/api/generate', (req, res) => {
  try {
    const { text, algorithm } = req.body;
    
    if (!text || !algorithm) {
      return res.status(400).json({ error: 'Text and algorithm are required' });
    }
    
    const hash = generateHash(text, algorithm);
    
    res.json({
      originalText: text,
      algorithm,
      hash
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/crack', async (req, res) => {
  try {
    const { hash, algorithm, dictionary } = req.body;
    
    if (!hash) {
      return res.status(400).json({ error: 'Hash is required' });
    }
    
    const detectedAlgorithm = algorithm || detectHashType(hash);
    
    if (detectedAlgorithm === 'unknown') {
      return res.status(400).json({ error: 'Unable to detect hash algorithm' });
    }
    
    const result = await crackHash(hash, detectedAlgorithm, dictionary);
    
    res.json({
      hash,
      algorithm: detectedAlgorithm,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: 'Error cracking hash' });
  }
});

app.get('/api/algorithms', (req, res) => {
  const algorithms = [
    { name: 'MD5', value: 'md5', description: '128-bit hash function' },
    { name: 'SHA-1', value: 'sha1', description: '160-bit hash function' },
    { name: 'SHA-256', value: 'sha256', description: '256-bit hash function' },
    { name: 'SHA-512', value: 'sha512', description: '512-bit hash function' },
    { name: 'SHA-224', value: 'sha224', description: '224-bit hash function' },
    { name: 'SHA-384', value: 'sha384', description: '384-bit hash function' },
    { name: 'RIPEMD-160', value: 'ripemd160', description: '160-bit hash function' },
    { name: 'Whirlpool', value: 'whirlpool', description: '512-bit hash function' },
    { name: 'bcrypt', value: 'bcrypt', description: 'Password hashing function' }
  ];
  
  res.json(algorithms);
});

// Test endpoint to verify hash cracking
app.get('/api/test-crack', async (req, res) => {
  try {
    // Test with a known hash
    const testPassword = 'password';
    const testHash = generateHash(testPassword, 'md5');
    
    console.log(`Testing crack with known password: ${testPassword}`);
    console.log(`Generated hash: ${testHash}`);
    
    const result = await crackHash(testHash, 'md5');
    
    res.json({
      testPassword,
      testHash,
      result,
      success: result.found && result.password === testPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Hash Hush Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
}); 