const regexp = /YYYY|YY|MM|DD|HH|hh|mm|SS|ss/g

const getDate = function (date, curr) {
  if (date instanceof Date) {
    return date
  }
  if (typeof date === 'string') {
    date = date.replace(/\-/g, '/')
    return new Date(date)
  }
  if (typeof date === 'number') {
    return new Date(date)
  }
  return new Date()
}

const formatDate = function (date = '', format = 'YYYYMMDDHHmm') {
  date = getDate(date)
  const padDate = (time) => time < 10 ? '0' + time : time;

  return format.replace(regexp, function (key) {
    switch (key) {
      case 'YYYY':
        return date.getFullYear();
      case 'YY':
        return (date.getFullYear() + '').slice(2);
      case 'MM':
        return padDate(date.getMonth() + 1);
      case 'DD':
        return padDate(date.getDate());
      case 'HH':
      case 'hh':
        return padDate(date.getHours());
      case 'mm':
        return padDate(date.getMinutes());
      case 'SS':
      case 'ss':
        return padDate(date.getSeconds());
      case 'week':
        return week[date.getDay()];
    }
  });
}

module.exports = {
  regexp,
  formatDate
}
