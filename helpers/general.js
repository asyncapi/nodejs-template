import _ from 'lodash';

export function camelCase(string) {
  return _.camelCase(string);
}

export function pascalCase(string) {
  string = _.camelCase(string);
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function kebabCase(string) {
  return _.kebabCase(string);
}

export function capitalize(string) {
  return _.capitalize(string);
}

export function oneLine(string) {
  return string.replace(/\n/g, ' ').trim();
}
