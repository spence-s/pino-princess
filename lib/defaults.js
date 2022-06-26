// whitelist overrides blacklist
const WHITE_LIST = [
  'res.statusCode',
  'req.method',
  'req.url',
  'level',
  'name',
  'ns',
  'msg',
  'responseTime',
];

const BLACK_LIST = ['req', 'res'];

module.exports = {
  WHITE_LIST,
  BLACK_LIST,
};
