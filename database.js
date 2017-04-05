let pg = require('pg');

const DATABASE_URL = 'postgres://xeqtnkjlbzfhad:0f8eb3c9a777c80ad960ea9ac1dd010596b1991daf523f65db58682308d1fab7@ec2-23-23-223-2.compute-1.amazonaws.com:5432/d7o63skrv6brj5'
pg.defaults.ssl = true;

pg.connect(DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');
});