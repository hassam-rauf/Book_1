const React = require('react');
const Link = ({ children, to, href, ...rest }) =>
  React.createElement('a', { href: to || href, ...rest }, children);
module.exports = Link;
module.exports.default = Link;
