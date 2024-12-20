import axios from 'axios';

export default async function fetchFromBackend() {
  let content: string;
  try {
    const response = await axios.get('http://localhost:3000/sample');
    content = response.data;
    console.log(response.data);
    return content;
  } catch {
    console.log('way gagana');
  }
}
