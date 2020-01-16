import axios from 'axios';

const CSRF_COOKIE_NAME = 'csrftoken';
const CSRF_HEADER_NAME = 'X-CSRFToken';

const session = axios.create({
  xsrfCookieName: CSRF_COOKIE_NAME,
  xsrfHeaderName: CSRF_HEADER_NAME,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

session.getStatic = async function getStatic(url) {
  if (url.startsWith(process.env.DC_BASE)) {
    const redirectUrl = (await session.get(url)).data.location;
    return (await axios.get(redirectUrl)).data;
  } else {
    return (await axios.get(url)).data;
  }
}

export default session;
